import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { query, queryOne, run } from '../db/init.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Shopier configuration
const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY || '';
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * GET /api/subscription/plans
 * List all active subscription plans
 */
router.get('/plans', (req, res) => {
    try {
        const plans = query(`
            SELECT id, name, slug, price, duration_days, description, features, is_active
            FROM subscription_plans
            WHERE is_active = 1
            ORDER BY price ASC
        `);

        // Parse features JSON
        const parsedPlans = plans.map(plan => ({
            ...plan,
            features: plan.features ? JSON.parse(plan.features) : []
        }));

        res.json({ plans: parsedPlans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 */
router.get('/status', authenticate, (req, res) => {
    try {
        const user = queryOne(
            'SELECT is_gold, gold_expires_at FROM users WHERE id = ?',
            [req.user.id]
        );

        const activeSubscription = queryOne(`
            SELECT s.*, p.name as plan_name, p.slug as plan_slug
            FROM subscriptions s
            JOIN subscription_plans p ON s.plan_id = p.id
            WHERE s.user_id = ? AND s.status = 'active' AND s.expires_at > datetime('now')
            ORDER BY s.expires_at DESC
            LIMIT 1
        `, [req.user.id]);

        res.json({
            isGold: user?.is_gold === 1,
            expiresAt: user?.gold_expires_at,
            subscription: activeSubscription || null
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

/**
 * POST /api/subscription/create
 * Create a new subscription and return Shopier payment form data
 */
router.post('/create', authenticate, [
    body('planId').isInt({ min: 1 }).withMessage('Geçerli bir plan seçin')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { planId } = req.body;
        const userId = req.user.id;

        // Get plan details
        const plan = queryOne(
            'SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1',
            [planId]
        );

        if (!plan) {
            return res.status(404).json({ error: 'Plan bulunamadı' });
        }

        // Get user details
        const user = queryOne(
            'SELECT username, email, display_name, phone FROM users WHERE id = ?',
            [userId]
        );

        // Generate unique order ID
        const orderId = `GOLD-${userId}-${Date.now()}`;

        // Create pending subscription
        const subscriptionResult = run(`
            INSERT INTO subscriptions (user_id, plan_id, status, shopier_order_id, amount_paid)
            VALUES (?, ?, 'pending', ?, ?)
        `, [userId, planId, orderId, plan.price]);

        // Create payment transaction record
        run(`
            INSERT INTO payment_transactions (subscription_id, user_id, order_id, amount, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [subscriptionResult.lastInsertRowid, userId, orderId, plan.price]);

        // Prepare Shopier payment data
        const buyerName = user.display_name || user.username;
        const buyerEmail = user.email;
        const buyerPhone = user.phone || '';

        // Create signature for Shopier
        const signatureData = `${SHOPIER_API_KEY}${orderId}${plan.price}${buyerEmail}`;
        const signature = crypto
            .createHmac('sha256', SHOPIER_API_SECRET)
            .update(signatureData)
            .digest('base64');

        // Return payment form data
        res.json({
            success: true,
            orderId,
            paymentData: {
                apiKey: SHOPIER_API_KEY,
                orderId,
                productName: `Jukeboxd Gold - ${plan.name}`,
                productType: 1, // Digital product
                buyerName,
                buyerEmail,
                buyerPhone,
                total: plan.price,
                currency: 'TRY',
                signature,
                // Shopier payment page URL
                paymentUrl: 'https://www.shopier.com/ShowProductNew/products.php'
            },
            plan: {
                id: plan.id,
                name: plan.name,
                price: plan.price,
                durationDays: plan.duration_days
            }
        });
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ error: 'Abonelik oluşturulamadı' });
    }
});

/**
 * POST /api/subscription/webhook
 * Shopier payment callback endpoint
 */
router.post('/webhook', async (req, res) => {
    try {
        const callbackData = req.body;
        console.log('Shopier webhook received:', callbackData);

        // Extract data from Shopier callback
        const {
            platform_order_id,
            payment_id,
            installment,
            status,
            signature: receivedSignature
        } = callbackData;

        if (!platform_order_id) {
            return res.status(400).json({ error: 'Missing order ID' });
        }

        // Verify signature (implement based on Shopier documentation)
        if (SHOPIER_API_SECRET && receivedSignature) {
            const expectedSignature = crypto
                .createHmac('sha256', SHOPIER_API_SECRET)
                .update(`${platform_order_id}${payment_id}`)
                .digest('base64');

            if (receivedSignature !== expectedSignature) {
                console.error('Invalid Shopier signature - possible fraud attempt');
                return res.status(403).json({ error: 'Invalid signature' });
            }
        } else if (process.env.NODE_ENV === 'production' && !SHOPIER_API_SECRET) {
            console.error('SHOPIER_API_SECRET not configured in production!');
        }

        // Find the subscription
        const subscription = queryOne(
            'SELECT * FROM subscriptions WHERE shopier_order_id = ?',
            [platform_order_id]
        );

        if (!subscription) {
            console.error('Subscription not found for order:', platform_order_id);
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Check for duplicate processing (idempotency)
        if (subscription.status === 'active') {
            console.log('Subscription already active, skipping:', platform_order_id);
            return res.json({ success: true, message: 'Already processed' });
        }

        // Get plan for duration
        const plan = queryOne(
            'SELECT duration_days FROM subscription_plans WHERE id = ?',
            [subscription.plan_id]
        );

        // Payment successful - activate subscription
        if (status === '1' || status === 'success' || status === 'completed') {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + (plan.duration_days * 24 * 60 * 60 * 1000));

            // Update subscription
            run(`
                UPDATE subscriptions 
                SET status = 'active', 
                    starts_at = datetime('now'), 
                    expires_at = ?,
                    shopier_payment_id = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            `, [expiresAt.toISOString(), payment_id, subscription.id]);

            // Update user gold status
            run(`
                UPDATE users 
                SET is_gold = 1, 
                    gold_expires_at = ?,
                    updated_at = datetime('now')
                WHERE id = ?
            `, [expiresAt.toISOString(), subscription.user_id]);

            // Update payment transaction
            run(`
                UPDATE payment_transactions 
                SET status = 'completed',
                    provider_transaction_id = ?,
                    callback_data = ?,
                    updated_at = datetime('now')
                WHERE order_id = ?
            `, [payment_id, JSON.stringify(callbackData), platform_order_id]);

            console.log(`Subscription activated for user ${subscription.user_id}`);
        } else {
            // Payment failed
            run(`
                UPDATE subscriptions 
                SET status = 'cancelled',
                    updated_at = datetime('now')
                WHERE id = ?
            `, [subscription.id]);

            run(`
                UPDATE payment_transactions 
                SET status = 'failed',
                    callback_data = ?,
                    updated_at = datetime('now')
                WHERE order_id = ?
            `, [JSON.stringify(callbackData), platform_order_id]);

            console.log(`Payment failed for order ${platform_order_id}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * GET /api/subscription/callback
 * Redirect endpoint after Shopier payment (for frontend redirection)
 */
router.get('/callback', (req, res) => {
    const { platform_order_id, status } = req.query;

    if (status === '1' || status === 'success') {
        res.redirect(`${FRONTEND_URL}/gold/success?order=${platform_order_id}`);
    } else {
        res.redirect(`${FRONTEND_URL}/gold/failed?order=${platform_order_id}`);
    }
});

/**
 * POST /api/subscription/cancel
 * Cancel current subscription (won't refund, just prevents renewal)
 */
router.post('/cancel', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        const activeSubscription = queryOne(`
            SELECT id FROM subscriptions 
            WHERE user_id = ? AND status = 'active'
            ORDER BY expires_at DESC
            LIMIT 1
        `, [userId]);

        if (!activeSubscription) {
            return res.status(404).json({ error: 'Aktif abonelik bulunamadı' });
        }

        // Mark as cancelled (user keeps access until expires_at)
        run(`
            UPDATE subscriptions 
            SET status = 'cancelled',
                updated_at = datetime('now')
            WHERE id = ?
        `, [activeSubscription.id]);

        res.json({
            success: true,
            message: 'Aboneliğiniz iptal edildi. Mevcut süreniz dolana kadar Gold avantajlarınız devam edecek.'
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'İptal işlemi başarısız' });
    }
});

/**
 * GET /api/subscription/history
 * Get user's subscription history
 */
router.get('/history', authenticate, (req, res) => {
    try {
        const subscriptions = query(`
            SELECT s.*, p.name as plan_name, p.price as plan_price
            FROM subscriptions s
            JOIN subscription_plans p ON s.plan_id = p.id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
            LIMIT 20
        `, [req.user.id]);

        res.json({ subscriptions });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
