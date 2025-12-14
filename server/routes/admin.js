import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, run } from '../db/init.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/stats
 * Dashboard statistics
 */
router.get('/stats', (req, res) => {
    try {
        // User stats
        const users = queryOne(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as new_this_week,
        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as new_this_month,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users WHERE is_active = 1
    `);

        // Content stats
        const ratings = queryOne('SELECT COUNT(*) as total FROM ratings');
        const reviews = queryOne('SELECT COUNT(*) as total FROM reviews');
        const likes = queryOne('SELECT COUNT(*) as total FROM likes');
        const playlists = queryOne('SELECT COUNT(*) as total FROM playlists');

        // Recent activity (last 7 days by day)
        const dailyActivity = query(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count
      FROM activities
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date DESC
    `);

        // Top rated tracks
        const topTracks = query(`
      SELECT 
        track_id, track_name, artist_name, album_image,
        AVG(rating) as avg_rating,
        COUNT(*) as rating_count
      FROM ratings
      GROUP BY track_id
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC
      LIMIT 10
    `);

        // Most active users
        const activeUsers = query(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.role
      FROM users u
      WHERE u.is_active = 1
      ORDER BY u.id DESC
      LIMIT 10
    `);

        // Subscription stats
        const subscriptionStats = queryOne(`
      SELECT 
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active,
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.amount_paid ELSE 0 END), 0) as revenue,
        COUNT(CASE WHEN s.created_at >= datetime('now', '-30 days') THEN 1 END) as new_this_month,
        COUNT(CASE WHEN s.status = 'active' AND s.expires_at <= datetime('now', '+7 days') THEN 1 END) as expiring_soon
      FROM subscriptions s
    `);

        res.json({
            users,
            content: {
                ratings: ratings?.total || 0,
                reviews: reviews?.total || 0,
                likes: likes?.total || 0,
                playlists: playlists?.total || 0
            },
            subscriptions: {
                active: subscriptionStats?.active || 0,
                total: subscriptionStats?.total || 0,
                revenue: subscriptionStats?.revenue || 0,
                new_this_month: subscriptionStats?.new_this_month || 0,
                expiring_soon: subscriptionStats?.expiring_soon || 0
            },
            dailyActivity,
            topTracks,
            activeUsers
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', (req, res) => {
    try {
        const { search, role, status, gold, limit = 50, offset = 0 } = req.query;

        let sql = `
      SELECT id, username, email, display_name, avatar_url, role, is_active, is_gold, gold_expires_at, created_at
      FROM users
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            sql += ` AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            sql += ` AND role = ?`;
            params.push(role);
        }

        if (status === 'active') {
            sql += ` AND is_active = 1`;
        } else if (status === 'inactive') {
            sql += ` AND is_active = 0`;
        }

        if (gold === 'gold') {
            sql += ` AND is_gold = 1`;
        } else if (gold === 'free') {
            sql += ` AND (is_gold = 0 OR is_gold IS NULL)`;
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const users = query(sql, params);

        // Get total count
        const totalResult = queryOne('SELECT COUNT(*) as count FROM users');
        const total = totalResult?.count || 0;

        res.json({ users, total });
    } catch (error) {
        console.error('Admin list users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * PUT /api/admin/users/:id
 * Update user (role, status)
 */
router.put('/users/:id', [
    body('role').optional().isIn(['user', 'admin']),
    body('isActive').optional().isBoolean()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { role, isActive, is_active } = req.body;
        const activeValue = is_active !== undefined ? is_active : isActive;

        // Prevent self-demotion
        if (Number(req.params.id) === req.user.id && role === 'user') {
            return res.status(400).json({ error: 'Cannot demote yourself' });
        }

        // Prevent self-deactivation
        if (Number(req.params.id) === req.user.id && activeValue === false) {
            return res.status(400).json({ error: 'Cannot deactivate yourself' });
        }

        if (role) run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        if (activeValue !== undefined) run('UPDATE users SET is_active = ? WHERE id = ?', [activeValue ? 1 : 0, req.params.id]);

        const user = queryOne(`
      SELECT id, username, email, display_name, role, is_active
      FROM users WHERE id = ?
    `, [req.params.id]);

        res.json({ user });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (soft delete - deactivate)
 */
router.delete('/users/:id', (req, res) => {
    try {
        // Prevent self-deletion
        if (Number(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        run('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);

        res.json({ message: 'User deactivated' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * GET /api/admin/reviews
 * List all reviews (for moderation)
 */
router.get('/reviews', (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;

        let sql = `
      SELECT r.*, u.username, u.display_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            sql += ` AND (r.content LIKE ? OR r.track_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const reviews = query(sql, params);

        res.json({ reviews });
    } catch (error) {
        console.error('Admin list reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * DELETE /api/admin/reviews/:id
 * Delete a review
 */
router.delete('/reviews/:id', (req, res) => {
    try {
        run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error('Admin delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

/**
 * GET /api/admin/playlists
 * List all playlists
 */
router.get('/playlists', (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;

        let sql = `
      SELECT p.*, u.username, u.display_name, u.avatar_url,
        (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as tracks_count
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (search) {
            sql += ` AND (p.name LIKE ? OR u.username LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const playlists = query(sql, params);

        // Get total count
        const totalResult = queryOne('SELECT COUNT(*) as count FROM playlists');
        const total = totalResult?.count || 0;

        res.json({ playlists, total });
    } catch (error) {
        console.error('Admin list playlists error:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

/**
 * DELETE /api/admin/playlists/:id
 * Delete a playlist
 */
router.delete('/playlists/:id', (req, res) => {
    try {
        run('DELETE FROM playlist_tracks WHERE playlist_id = ?', [req.params.id]);
        run('DELETE FROM playlists WHERE id = ?', [req.params.id]);
        res.json({ message: 'Playlist deleted' });
    } catch (error) {
        console.error('Admin delete playlist error:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

// ============================================
// SUBSCRIPTION MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/admin/subscriptions
 * List all subscriptions with user info
 */
router.get('/subscriptions', (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let sql = `
            SELECT s.*, 
                   u.username, u.display_name, u.avatar_url,
                   p.name as plan_name
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            JOIN subscription_plans p ON s.plan_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            sql += ` AND s.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const subscriptions = query(sql, params);

        // Get stats
        const stats = queryOne(`
            SELECT 
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(*) as total,
                COALESCE(SUM(amount_paid), 0) as revenue
            FROM subscriptions
        `);

        res.json({
            subscriptions: subscriptions.map(s => ({
                ...s,
                user: { username: s.username, display_name: s.display_name, avatar_url: s.avatar_url }
            })),
            stats
        });
    } catch (error) {
        console.error('Admin subscriptions error:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

/**
 * POST /api/admin/subscriptions/:id/activate
 * Manually activate a subscription
 */
router.post('/subscriptions/:id/activate', (req, res) => {
    try {
        const subscription = queryOne('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        const plan = queryOne('SELECT * FROM subscription_plans WHERE id = ?', [subscription.plan_id]);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (plan?.duration_days || 30));

        run(`UPDATE subscriptions SET status = 'active', starts_at = datetime('now'), expires_at = ? WHERE id = ?`,
            [expiresAt.toISOString(), req.params.id]);
        run(`UPDATE users SET is_gold = 1, gold_expires_at = ? WHERE id = ?`,
            [expiresAt.toISOString(), subscription.user_id]);

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'subscription.activate', `subscription_${req.params.id}`, JSON.stringify({ user_id: subscription.user_id }), req.ip]);

        res.json({ message: 'Subscription activated' });
    } catch (error) {
        console.error('Activate subscription error:', error);
        res.status(500).json({ error: 'Failed to activate subscription' });
    }
});

/**
 * POST /api/admin/subscriptions/:id/cancel
 * Cancel a subscription
 */
router.post('/subscriptions/:id/cancel', (req, res) => {
    try {
        const subscription = queryOne('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        run(`UPDATE subscriptions SET status = 'cancelled' WHERE id = ?`, [req.params.id]);
        run(`UPDATE users SET is_gold = 0, gold_expires_at = NULL WHERE id = ?`, [subscription.user_id]);

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'subscription.cancel', `subscription_${req.params.id}`, JSON.stringify({ user_id: subscription.user_id }), req.ip]);

        res.json({ message: 'Subscription cancelled' });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// ============================================
// REPORTS ENDPOINTS
// ============================================

/**
 * GET /api/admin/reports/:type
 * Generate reports (users, revenue, content)
 */
router.get('/reports/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { start, end } = req.query;

        let report = { title: '', summary: {}, data: [] };

        switch (type) {
            case 'users':
                report.title = 'Kullanıcı Raporu';
                report.summary = queryOne(`
                    SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as newThisMonth,
                        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active,
                        COUNT(CASE WHEN is_gold = 1 THEN 1 END) as goldMembers
                    FROM users
                `);
                report.data = query(`
                    SELECT strftime('%Y-%m', created_at) as period,
                           COUNT(*) as newUsers,
                           COUNT(CASE WHEN is_active = 1 THEN 1 END) as activeUsers
                    FROM users
                    GROUP BY period
                    ORDER BY period DESC
                    LIMIT 12
                `);
                break;

            case 'revenue':
                report.title = 'Gelir Raporu';
                report.summary = queryOne(`
                    SELECT 
                        COALESCE(SUM(amount_paid), 0) as total,
                        COALESCE(SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN amount_paid ELSE 0 END), 0) as thisMonth,
                        COUNT(*) as subscriptions
                    FROM subscriptions WHERE status IN ('active', 'expired')
                `);
                report.data = query(`
                    SELECT strftime('%Y-%m', created_at) as period,
                           COALESCE(SUM(amount_paid), 0) as revenue,
                           COUNT(*) as subscriptions
                    FROM subscriptions
                    WHERE status IN ('active', 'expired')
                    GROUP BY period
                    ORDER BY period DESC
                    LIMIT 12
                `);
                break;

            case 'content':
                report.title = 'İçerik Raporu';
                report.summary = queryOne(`
                    SELECT 
                        (SELECT COUNT(*) FROM ratings) as ratings,
                        (SELECT COUNT(*) FROM reviews) as reviews,
                        (SELECT COUNT(*) FROM playlists) as playlists,
                        (SELECT AVG(rating) FROM ratings) as avgRating
                `);
                report.data = query(`
                    SELECT strftime('%Y-%m', created_at) as period,
                           COUNT(*) as ratings
                    FROM ratings
                    GROUP BY period
                    ORDER BY period DESC
                    LIMIT 12
                `);
                break;

            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        res.json(report);
    } catch (error) {
        console.error('Reports error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

/**
 * GET /api/admin/notifications
 * List all notifications
 */
router.get('/notifications', (req, res) => {
    try {
        const notifications = query(`
            SELECT n.*, u.username as sent_by_username
            FROM notifications n
            LEFT JOIN users u ON n.sent_by = u.id
            ORDER BY n.created_at DESC
            LIMIT 100
        `);
        res.json({ notifications });
    } catch (error) {
        console.error('Notifications list error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * POST /api/admin/notifications/send
 * Send a new notification
 */
router.post('/notifications/send', (req, res) => {
    try {
        const { title, message, targetGroup = 'all', type = 'info' } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required' });
        }

        // Count target users
        let countSql = 'SELECT COUNT(*) as count FROM users WHERE is_active = 1';
        if (targetGroup === 'gold') countSql += ' AND is_gold = 1';
        if (targetGroup === 'free') countSql += ' AND is_gold = 0';
        const { count } = queryOne(countSql);

        // Insert notification
        const result = run(`
            INSERT INTO notifications (title, message, type, target_group, sent_by, sent_count)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, message, type, targetGroup, req.user.id, count]);

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'notification.send', `notification_${result.lastInsertRowid}`, JSON.stringify({ targetGroup, count }), req.ip]);

        res.json({ message: 'Notification sent', id: result.lastInsertRowid, sentCount: count });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

/**
 * DELETE /api/admin/notifications/:id
 * Delete a notification
 */
router.delete('/notifications/:id', (req, res) => {
    try {
        run('DELETE FROM user_notifications WHERE notification_id = ?', [req.params.id]);
        run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// ============================================
// AUDIT LOG ENDPOINTS
// ============================================

/**
 * GET /api/admin/audit-logs
 * List audit logs
 */
router.get('/audit-logs', (req, res) => {
    try {
        const { action, limit = 100, offset = 0 } = req.query;

        let sql = `SELECT * FROM audit_logs WHERE 1=1`;
        const params = [];

        if (action && action !== 'all') {
            sql += ` AND action LIKE ?`;
            params.push(`${action}%`);
        }

        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const logs = query(sql, params);
        res.json({ logs: logs.map(log => ({ ...log, details: log.details ? JSON.parse(log.details) : {} })) });
    } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ============================================
// SETTINGS ENDPOINTS
// ============================================

/**
 * GET /api/admin/settings
 * Get all settings
 */
router.get('/settings', (req, res) => {
    try {
        const settingsArray = query('SELECT * FROM site_settings');
        const settings = {};
        settingsArray.forEach(s => {
            settings[s.key] = s.value === 'true' ? true : s.value === 'false' ? false : s.value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

/**
 * PUT /api/admin/settings
 * Update settings
 */
router.put('/settings', (req, res) => {
    try {
        const settings = req.body;

        for (const [key, value] of Object.entries(settings)) {
            const stringValue = typeof value === 'boolean' ? String(value) : value;
            run(`INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`, [key, stringValue]);
        }

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'settings.update', 'site_settings', JSON.stringify(settings), req.ip]);

        res.json({ message: 'Settings updated' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ============================================
// ENHANCED USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * POST /api/admin/users/:id/gold
 * Toggle Gold membership for a user
 */
router.post('/users/:id/gold', (req, res) => {
    try {
        const { action, days = 30 } = req.body;
        const userId = req.params.id;

        const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (action === 'activate') {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(days));

            run(`UPDATE users SET is_gold = 1, gold_expires_at = ? WHERE id = ?`,
                [expiresAt.toISOString(), userId]);

            // Log action
            run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
                [req.user.id, req.user.username, 'user.gold_activate', user.username, JSON.stringify({ days }), req.ip]);

            res.json({ message: 'Gold membership activated', expiresAt });
        } else {
            run(`UPDATE users SET is_gold = 0, gold_expires_at = NULL WHERE id = ?`, [userId]);

            // Log action
            run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
                [req.user.id, req.user.username, 'user.gold_deactivate', user.username, JSON.stringify({}), req.ip]);

            res.json({ message: 'Gold membership deactivated' });
        }
    } catch (error) {
        console.error('Gold toggle error:', error);
        res.status(500).json({ error: 'Failed to update Gold status' });
    }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password
 */
router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.params.id;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Import bcrypt dynamically
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(newPassword, 10);

        run(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
            [passwordHash, userId]);

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'user.password_reset', user.username, JSON.stringify({}), req.ip]);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

/**
 * POST /api/admin/notifications/send-to-user
 * Send notification to specific user
 */
router.post('/notifications/send-to-user', (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({ error: 'userId, title and message are required' });
        }

        const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Insert notification
        const result = run(`
            INSERT INTO notifications (title, message, type, target_group, sent_by, sent_count)
            VALUES (?, ?, 'info', 'individual', ?, 1)
        `, [title, message, req.user.id]);

        // Create user notification record
        run(`INSERT INTO user_notifications (user_id, notification_id) VALUES (?, ?)`,
            [userId, result.lastInsertRowid]);

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'notification.send_individual', user.username, JSON.stringify({ title }), req.ip]);

        res.json({ message: 'Notification sent', id: result.lastInsertRowid });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

/**
 * GET /api/admin/email-settings
 * Get email templates and SMTP settings
 */
router.get('/email-settings', (req, res) => {
    try {
        // Ensure email_settings table exists
        try {
            run(`
                CREATE TABLE IF NOT EXISTS email_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE NOT NULL,
                    value TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (e) { /* Table exists */ }

        const settings = {};
        const rows = query('SELECT key, value FROM email_settings');
        rows.forEach(row => {
            try {
                settings[row.key] = JSON.parse(row.value);
            } catch {
                settings[row.key] = row.value;
            }
        });

        res.json({
            templates: settings.templates || {},
            settings: settings.smtp || {}
        });
    } catch (error) {
        console.error('Get email settings error:', error);
        res.status(500).json({ error: 'Failed to get email settings' });
    }
});

/**
 * PUT /api/admin/email-settings
 * Update email templates and SMTP settings
 */
router.put('/email-settings', (req, res) => {
    try {
        const { templates, settings } = req.body;

        // Store templates
        if (templates) {
            const existingTemplates = queryOne('SELECT value FROM email_settings WHERE key = ?', ['templates']);
            if (existingTemplates) {
                run('UPDATE email_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
                    [JSON.stringify(templates), 'templates']);
            } else {
                run('INSERT INTO email_settings (key, value) VALUES (?, ?)',
                    ['templates', JSON.stringify(templates)]);
            }
        }

        // Store SMTP settings
        if (settings) {
            const existingSmtp = queryOne('SELECT value FROM email_settings WHERE key = ?', ['smtp']);
            if (existingSmtp) {
                run('UPDATE email_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
                    [JSON.stringify(settings), 'smtp']);
            } else {
                run('INSERT INTO email_settings (key, value) VALUES (?, ?)',
                    ['smtp', JSON.stringify(settings)]);
            }
        }

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'email_settings.update', 'email_settings',
            JSON.stringify({ templatesUpdated: !!templates, smtpUpdated: !!settings }), req.ip]);

        res.json({ message: 'Email settings updated' });
    } catch (error) {
        console.error('Update email settings error:', error);
        res.status(500).json({ error: 'Failed to update email settings' });
    }
});

/**
 * POST /api/admin/email-test
 * Send test email
 */
router.post('/email-test', (req, res) => {
    try {
        const { templateId } = req.body;

        // In a real implementation, this would send an actual email
        // For now, we'll just log it and return success
        console.log(`Test email requested for template: ${templateId}`);
        console.log(`Would send to admin: ${req.user.email}`);

        // Log action
        run(`INSERT INTO audit_logs (admin_id, admin_username, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, req.user.username, 'email.test', templateId,
            JSON.stringify({ recipient: req.user.email }), req.ip]);

        res.json({
            message: 'Test email sent',
            note: 'Email sending is simulated. Configure SMTP for actual delivery.'
        });
    } catch (error) {
        console.error('Send test email error:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

/**
 * GET /api/admin/email-stats
 * Get email sending statistics
 */
router.get('/email-stats', (req, res) => {
    try {
        // Ensure email_logs table exists
        try {
            run(`
                CREATE TABLE IF NOT EXISTS email_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    template_id TEXT NOT NULL,
                    recipient_id INTEGER,
                    recipient_email TEXT,
                    status TEXT DEFAULT 'pending',
                    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    error TEXT
                )
            `);
        } catch (e) { /* Table exists */ }

        const stats = queryOne(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
            FROM email_logs
            WHERE sent_at >= datetime('now', '-30 days')
        `);

        const byTemplate = query(`
            SELECT 
                template_id,
                COUNT(*) as count,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent
            FROM email_logs
            WHERE sent_at >= datetime('now', '-30 days')
            GROUP BY template_id
        `);

        const recentLogs = query(`
            SELECT * FROM email_logs
            ORDER BY sent_at DESC
            LIMIT 20
        `);

        res.json({
            stats: stats || { total: 0, sent: 0, failed: 0, pending: 0 },
            byTemplate,
            recentLogs
        });
    } catch (error) {
        console.error('Get email stats error:', error);
        res.status(500).json({ error: 'Failed to get email stats' });
    }
});

export default router;


