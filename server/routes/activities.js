import { Router } from 'express';
import { query, queryOne } from '../db/init.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/activities
 * Get activity feed
 */
router.get('/', optionalAuth, (req, res) => {
    try {
        const { user_id, type, limit = 30, offset = 0 } = req.query;

        let sql = `
      SELECT a.*, u.username, u.display_name, u.avatar_url
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE u.is_active = 1
    `;
        const params = [];

        if (user_id) {
            sql += ` AND a.user_id = ?`;
            params.push(user_id);
        }

        if (type) {
            sql += ` AND a.type = ?`;
            params.push(type);
        }

        sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const activities = query(sql, params);

        // Parse metadata JSON
        activities.forEach(activity => {
            if (activity.metadata) {
                try {
                    activity.metadata = JSON.parse(activity.metadata);
                } catch (e) {
                    activity.metadata = {};
                }
            }
        });

        res.json({ activities });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

/**
 * GET /api/activities/stats
 * Get activity statistics
 */
router.get('/stats', (req, res) => {
    try {
        // Today's stats
        const today = queryOne(`
      SELECT 
        COUNT(CASE WHEN type = 'rating' THEN 1 END) as ratings,
        COUNT(CASE WHEN type = 'review' THEN 1 END) as reviews,
        COUNT(CASE WHEN type = 'like' THEN 1 END) as likes,
        COUNT(CASE WHEN type = 'playlist' THEN 1 END) as playlists
      FROM activities
      WHERE date(created_at) = date('now')
    `);

        // Most active users this week
        const activeUsers = query(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, COUNT(*) as activity_count
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.created_at >= datetime('now', '-7 days') AND u.is_active = 1
      GROUP BY u.id
      ORDER BY activity_count DESC
      LIMIT 10
    `);

        res.json({ today, activeUsers });
    } catch (error) {
        console.error('Get activity stats error:', error);
        res.status(500).json({ error: 'Failed to fetch activity stats' });
    }
});

export default router;
