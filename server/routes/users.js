import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, run } from '../db/init.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/users
 * List users (public profiles)
 */
router.get('/', optionalAuth, (req, res) => {
    try {
        const { search, limit = 20, offset = 0 } = req.query;

        let sql = `
      SELECT id, username, display_name, avatar_url, bio
      FROM users
      WHERE is_active = 1
    `;
        const params = [];

        if (search) {
            sql += ` AND (username LIKE ? OR display_name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const users = query(sql, params);

        res.json({ users });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * GET /api/users/:id
 * Get user profile
 */
router.get('/:id', optionalAuth, (req, res) => {
    try {
        const userId = req.params.id;

        // Check if id is numeric or username
        const isNumeric = /^\d+$/.test(userId);
        const whereClause = isNumeric ? 'id = ?' : 'username = ?';

        const user = queryOne(`
      SELECT id, username, display_name, avatar_url, bio, created_at
      FROM users
      WHERE ${whereClause} AND is_active = 1
    `, [userId]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get counts
        const followersCount = queryOne('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [user.id]);
        const followingCount = queryOne('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [user.id]);
        const ratingsCount = queryOne('SELECT COUNT(*) as count FROM ratings WHERE user_id = ?', [user.id]);
        const reviewsCount = queryOne('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?', [user.id]);

        user.followers_count = followersCount?.count || 0;
        user.following_count = followingCount?.count || 0;
        user.ratings_count = ratingsCount?.count || 0;
        user.reviews_count = reviewsCount?.count || 0;

        // Check if current user follows this user
        if (req.user) {
            const follow = queryOne(
                'SELECT 1 as exists FROM follows WHERE follower_id = ? AND following_id = ?',
                [req.user.id, user.id]
            );
            user.is_following = !!follow;
        }

        // Get recent ratings
        user.recent_ratings = query(`
      SELECT track_id, track_name, artist_name, album_image, rating, created_at
      FROM ratings WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 5
    `, [user.id]);

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

/**
 * PUT /api/users/:id
 * Update user profile
 */
router.put('/:id', authenticate, [
    body('displayName').optional().trim().isLength({ max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('avatarUrl').optional().isURL()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Can only update own profile (unless admin)
        if (Number(req.params.id) !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Cannot update other users profile' });
        }

        const { displayName, bio, avatarUrl } = req.body;

        if (displayName) run('UPDATE users SET display_name = ? WHERE id = ?', [displayName, req.params.id]);
        if (bio !== undefined) run('UPDATE users SET bio = ? WHERE id = ?', [bio, req.params.id]);
        if (avatarUrl) run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.params.id]);

        const user = queryOne(`
      SELECT id, username, email, display_name, avatar_url, bio, role
      FROM users WHERE id = ?
    `, [req.params.id]);

        res.json({ user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /api/users/:id/follow
 * Follow a user
 */
router.post('/:id/follow', authenticate, (req, res) => {
    try {
        const followingId = Number(req.params.id);

        if (followingId === req.user.id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        // Check if user exists
        const targetUser = queryOne('SELECT id FROM users WHERE id = ? AND is_active = 1', [followingId]);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Insert follow (ignore if already exists)
        try {
            run('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, followingId]);
        } catch (e) {
            // Already following, ignore
        }

        res.json({ message: 'Followed successfully' });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

/**
 * DELETE /api/users/:id/follow
 * Unfollow a user
 */
router.delete('/:id/follow', authenticate, (req, res) => {
    try {
        run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});

/**
 * PUT /api/users/profile
 * Update own profile (simplified for onboarding)
 */
router.put('/profile', authenticate, [
    body('display_name').optional().trim().isLength({ max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { display_name, bio } = req.body;

        if (display_name !== undefined) {
            run('UPDATE users SET display_name = ? WHERE id = ?', [display_name, req.user.id]);
        }
        if (bio !== undefined) {
            run('UPDATE users SET bio = ? WHERE id = ?', [bio, req.user.id]);
        }

        const user = queryOne(`
            SELECT id, username, email, display_name, avatar_url, bio, role
            FROM users WHERE id = ?
        `, [req.user.id]);

        res.json({ user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * PUT /api/users/preferences
 * Update user preferences (genre preferences for onboarding)
 */
router.put('/preferences', authenticate, (req, res) => {
    try {
        const { genres } = req.body;

        if (genres && Array.isArray(genres)) {
            // Store genres as JSON in a preferences field
            // First, check if we need to add the column
            try {
                run(`ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT '{}'`);
            } catch (e) {
                // Column likely already exists
            }

            const preferences = JSON.stringify({ genres });
            run('UPDATE users SET preferences = ? WHERE id = ?', [preferences, req.user.id]);
        }

        res.json({ message: 'Preferences updated' });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get('/preferences', authenticate, (req, res) => {
    try {
        const user = queryOne('SELECT preferences FROM users WHERE id = ?', [req.user.id]);
        const preferences = user?.preferences ? JSON.parse(user.preferences) : { genres: [] };
        res.json(preferences);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

/**
 * POST /api/users/avatar
 * Upload avatar image (as base64 data URL for simplicity)
 */
router.post('/avatar', authenticate, (req, res) => {
    try {
        // For multipart form data, we need to handle the file
        // For simplicity, we'll convert to base64 and store as data URL
        // In production, you'd use a file upload service like S3

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);

                // Check if it's a FormData request
                const contentType = req.headers['content-type'] || '';

                if (contentType.includes('multipart/form-data')) {
                    // Simple boundary parsing for FormData
                    const boundary = contentType.split('boundary=')[1];
                    if (boundary) {
                        const parts = buffer.toString('binary').split('--' + boundary);
                        for (const part of parts) {
                            if (part.includes('filename=') && part.includes('image')) {
                                // Extract image data
                                const headerEnd = part.indexOf('\r\n\r\n');
                                if (headerEnd !== -1) {
                                    const imageData = part.slice(headerEnd + 4);
                                    const cleanData = imageData.replace(/\r\n--$/, '');
                                    const base64 = Buffer.from(cleanData, 'binary').toString('base64');
                                    const dataUrl = `data:image/jpeg;base64,${base64}`;

                                    run('UPDATE users SET avatar_url = ? WHERE id = ?', [dataUrl, req.user.id]);

                                    return res.json({
                                        message: 'Avatar updated',
                                        avatar_url: dataUrl
                                    });
                                }
                            }
                        }
                    }
                }

                res.status(400).json({ error: 'Invalid image data' });
            } catch (err) {
                console.error('Avatar parse error:', err);
                res.status(500).json({ error: 'Failed to process avatar' });
            }
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

/**
 * GET /api/users/digest-settings
 * Get weekly digest email settings
 */
router.get('/digest-settings', authenticate, (req, res) => {
    try {
        // Ensure digest_settings column exists
        try {
            run(`ALTER TABLE users ADD COLUMN digest_settings TEXT DEFAULT '{}'`);
        } catch (e) { /* Column exists */ }

        const user = queryOne('SELECT digest_settings FROM users WHERE id = ?', [req.user.id]);
        const settings = user?.digest_settings ? JSON.parse(user.digest_settings) : {
            enabled: true,
            preferences: {
                top_songs: true,
                friend_activity: true,
                recommendations: true,
                new_followers: true
            }
        };
        res.json(settings);
    } catch (error) {
        console.error('Get digest settings error:', error);
        res.status(500).json({ error: 'Failed to get digest settings' });
    }
});

/**
 * PUT /api/users/digest-settings
 * Update weekly digest email settings
 */
router.put('/digest-settings', authenticate, (req, res) => {
    try {
        const { enabled, preferences } = req.body;
        const settings = JSON.stringify({ enabled, preferences });

        // Ensure column exists
        try {
            run(`ALTER TABLE users ADD COLUMN digest_settings TEXT DEFAULT '{}'`);
        } catch (e) { /* Column exists */ }

        run('UPDATE users SET digest_settings = ? WHERE id = ?', [settings, req.user.id]);
        res.json({ message: 'Digest settings updated' });
    } catch (error) {
        console.error('Update digest settings error:', error);
        res.status(500).json({ error: 'Failed to update digest settings' });
    }
});

export default router;



