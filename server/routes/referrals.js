import { Router } from 'express';
import { query, queryOne, run } from '../db/init.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Generate unique referral code
function generateReferralCode(userId, username) {
    const prefix = username.toUpperCase().slice(0, 4);
    const suffix = userId.toString(36).toUpperCase();
    return `${prefix}${suffix}`;
}

/**
 * GET /api/referrals/code
 * Get user's referral code and stats
 */
router.get('/code', authenticate, (req, res) => {
    try {
        // Check if user has a referral code
        let referral = queryOne(
            'SELECT * FROM referral_codes WHERE user_id = ?',
            [req.user.id]
        );

        // Create one if not exists
        if (!referral) {
            const code = generateReferralCode(req.user.id, req.user.username);
            try {
                run(
                    'INSERT INTO referral_codes (user_id, code) VALUES (?, ?)',
                    [req.user.id, code]
                );
                referral = { code };
            } catch (e) {
                // Table might not exist, create it
                run(`
                    CREATE TABLE IF NOT EXISTS referral_codes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER UNIQUE NOT NULL,
                        code TEXT UNIQUE NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                `);
                run(`
                    CREATE TABLE IF NOT EXISTS referrals (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        referrer_id INTEGER NOT NULL,
                        referred_id INTEGER NOT NULL,
                        status TEXT DEFAULT 'pending',
                        gold_granted INTEGER DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (referrer_id) REFERENCES users(id),
                        FOREIGN KEY (referred_id) REFERENCES users(id)
                    )
                `);
                run(
                    'INSERT INTO referral_codes (user_id, code) VALUES (?, ?)',
                    [req.user.id, code]
                );
                referral = { code };
            }
        }

        // Get referral stats
        const stats = queryOne(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM referrals WHERE referrer_id = ?
        `, [req.user.id]);

        res.json({
            code: referral.code,
            stats: {
                total: stats?.total || 0,
                successful: stats?.successful || 0,
                pending: stats?.pending || 0
            }
        });
    } catch (error) {
        console.error('Get referral code error:', error);
        res.status(500).json({ error: 'Failed to get referral code' });
    }
});

/**
 * POST /api/referrals/apply
 * Apply a referral code (called during registration)
 */
router.post('/apply', authenticate, (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Referral code required' });
        }

        // Find the referral code
        const referralCode = queryOne(
            'SELECT * FROM referral_codes WHERE code = ?',
            [code.toUpperCase()]
        );

        if (!referralCode) {
            return res.status(404).json({ error: 'Invalid referral code' });
        }

        if (referralCode.user_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot use your own referral code' });
        }

        // Check if already referred
        const existing = queryOne(
            'SELECT * FROM referrals WHERE referred_id = ?',
            [req.user.id]
        );

        if (existing) {
            return res.status(400).json({ error: 'Already used a referral code' });
        }

        // Create referral
        run(
            'INSERT INTO referrals (referrer_id, referred_id, status) VALUES (?, ?, ?)',
            [referralCode.user_id, req.user.id, 'completed']
        );

        // Check if referrer earned Gold (every 3 successful referrals)
        const successfulCount = queryOne(
            `SELECT COUNT(*) as count FROM referrals 
             WHERE referrer_id = ? AND status = 'completed' AND gold_granted = 0`,
            [referralCode.user_id]
        );

        if (successfulCount?.count >= 3) {
            // Grant 1 month Gold
            const goldExpiry = new Date();
            goldExpiry.setMonth(goldExpiry.getMonth() + 1);

            run(
                'UPDATE users SET is_gold = 1, gold_expires_at = ? WHERE id = ?',
                [goldExpiry.toISOString(), referralCode.user_id]
            );

            // Mark referrals as gold_granted
            run(
                `UPDATE referrals SET gold_granted = 1 
                 WHERE referrer_id = ? AND status = 'completed' AND gold_granted = 0`,
                [referralCode.user_id]
            );
        }

        res.json({ message: 'Referral code applied successfully' });
    } catch (error) {
        console.error('Apply referral error:', error);
        res.status(500).json({ error: 'Failed to apply referral code' });
    }
});

/**
 * GET /api/referrals/stats
 * Get detailed referral statistics
 */
router.get('/stats', authenticate, (req, res) => {
    try {
        const referrals = query(`
            SELECT r.*, u.username, u.display_name, u.avatar_url
            FROM referrals r
            JOIN users u ON r.referred_id = u.id
            WHERE r.referrer_id = ?
            ORDER BY r.created_at DESC
        `, [req.user.id]);

        const goldMonthsEarned = queryOne(
            `SELECT COUNT(DISTINCT id) / 3 as months 
             FROM referrals 
             WHERE referrer_id = ? AND status = 'completed'`,
            [req.user.id]
        );

        res.json({
            referrals,
            goldMonthsEarned: goldMonthsEarned?.months || 0
        });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({ error: 'Failed to get referral stats' });
    }
});

export default router;
