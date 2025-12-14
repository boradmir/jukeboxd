import { Router } from 'express';
import { query, queryOne, run } from '../db/init.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Badge definitions with unlock conditions
const BADGE_DEFINITIONS = {
    first_rating: { check: (stats) => stats.ratings >= 1 },
    ten_ratings: { check: (stats) => stats.ratings >= 10 },
    fifty_ratings: { check: (stats) => stats.ratings >= 50 },
    first_review: { check: (stats) => stats.reviews >= 1 },
    first_list: { check: (stats) => stats.lists >= 1 },
    ten_followers: { check: (stats) => stats.followers >= 10 },
    fifty_followers: { check: (stats) => stats.followers >= 50 },
    week_streak: { check: (stats) => stats.streak >= 7 },
    month_streak: { check: (stats) => stats.streak >= 30 },
    gold_member: { check: (stats) => stats.isGold },
    first_like: { check: (stats) => stats.likes >= 1 },
    referral_master: { check: (stats) => stats.referrals >= 5 }
};

/**
 * GET /api/badges
 * Get user's badges
 */
router.get('/', authenticate, (req, res) => {
    try {
        // Ensure badges table exists
        try {
            run(`
                CREATE TABLE IF NOT EXISTS user_badges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    badge_id TEXT NOT NULL,
                    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, badge_id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
        } catch (e) { /* Table exists */ }

        const badges = query(
            'SELECT * FROM user_badges WHERE user_id = ?',
            [req.user.id]
        );

        res.json({ badges });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
});

/**
 * POST /api/badges/check
 * Check and award new badges
 */
router.post('/check', authenticate, (req, res) => {
    try {
        // Get user stats
        const ratingsCount = queryOne('SELECT COUNT(*) as count FROM ratings WHERE user_id = ?', [req.user.id]);
        const reviewsCount = queryOne('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?', [req.user.id]);
        const listsCount = queryOne('SELECT COUNT(*) as count FROM playlists WHERE user_id = ?', [req.user.id]);
        const followersCount = queryOne('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [req.user.id]);
        const likesCount = queryOne('SELECT COUNT(*) as count FROM likes WHERE user_id = ?', [req.user.id]);
        const referralsCount = queryOne('SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ? AND status = ?', [req.user.id, 'completed']);
        const user = queryOne('SELECT is_gold FROM users WHERE id = ?', [req.user.id]);

        const stats = {
            ratings: ratingsCount?.count || 0,
            reviews: reviewsCount?.count || 0,
            lists: listsCount?.count || 0,
            followers: followersCount?.count || 0,
            likes: likesCount?.count || 0,
            referrals: referralsCount?.count || 0,
            isGold: user?.is_gold === 1,
            streak: 0 // TODO: Calculate streak
        };

        // Get existing badges
        const existingBadges = query(
            'SELECT badge_id FROM user_badges WHERE user_id = ?',
            [req.user.id]
        );
        const earnedBadgeIds = new Set(existingBadges.map(b => b.badge_id));

        // Check for new badges
        const newBadges = [];
        for (const [badgeId, definition] of Object.entries(BADGE_DEFINITIONS)) {
            if (!earnedBadgeIds.has(badgeId) && definition.check(stats)) {
                try {
                    run(
                        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
                        [req.user.id, badgeId]
                    );
                    newBadges.push(badgeId);
                } catch (e) {
                    // Badge might already exist
                }
            }
        }

        res.json({
            newBadges,
            stats,
            totalBadges: earnedBadgeIds.size + newBadges.length
        });
    } catch (error) {
        console.error('Check badges error:', error);
        res.status(500).json({ error: 'Failed to check badges' });
    }
});

/**
 * GET /api/badges/all
 * Get all available badges with user's earned status
 */
router.get('/all', authenticate, (req, res) => {
    try {
        const earnedBadges = query(
            'SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?',
            [req.user.id]
        );

        const earnedMap = {};
        earnedBadges.forEach(b => {
            earnedMap[b.badge_id] = b.earned_at;
        });

        const allBadges = Object.keys(BADGE_DEFINITIONS).map(id => ({
            id,
            earned: !!earnedMap[id],
            earnedAt: earnedMap[id] || null
        }));

        res.json({ badges: allBadges });
    } catch (error) {
        console.error('Get all badges error:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
});

export default router;
