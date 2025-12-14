import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, run } from '../db/init.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/tracks/:id/rate
 * Rate a track
 */
router.post('/:id/rate', authenticate, [
    body('rating').isFloat({ min: 0.5, max: 5 }),
    body('trackName').optional().trim(),
    body('artistName').optional().trim(),
    body('albumImage').optional()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rating, trackName, artistName, albumImage } = req.body;
        const trackId = req.params.id;

        // Check if rating exists
        const existing = queryOne('SELECT id FROM ratings WHERE user_id = ? AND track_id = ?', [req.user.id, trackId]);

        if (existing) {
            run('UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [rating, existing.id]);
        } else {
            run(`
        INSERT INTO ratings (user_id, track_id, track_name, artist_name, album_image, rating)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [req.user.id, trackId, trackName, artistName, albumImage, rating]);

            // Create activity
            run(`
        INSERT INTO activities (user_id, type, target_type, target_id, target_name, metadata)
        VALUES (?, 'rating', 'track', ?, ?, ?)
      `, [req.user.id, trackId, trackName, JSON.stringify({ rating, artistName, albumImage })]);
        }

        res.json({ message: 'Rating saved', rating });
    } catch (error) {
        console.error('Rate track error:', error);
        res.status(500).json({ error: 'Failed to save rating' });
    }
});

/**
 * DELETE /api/tracks/:id/rate
 * Remove rating
 */
router.delete('/:id/rate', authenticate, (req, res) => {
    try {
        run('DELETE FROM ratings WHERE user_id = ? AND track_id = ?', [req.user.id, req.params.id]);
        res.json({ message: 'Rating removed' });
    } catch (error) {
        console.error('Remove rating error:', error);
        res.status(500).json({ error: 'Failed to remove rating' });
    }
});

/**
 * GET /api/tracks/:id/ratings
 * Get ratings for a track
 */
router.get('/:id/ratings', optionalAuth, (req, res) => {
    try {
        const trackId = req.params.id;

        // Get average and count
        const stats = queryOne(`
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating
      FROM ratings WHERE track_id = ?
    `, [trackId]);

        // Get user's rating if authenticated
        let userRating = null;
        if (req.user) {
            const rating = queryOne(
                'SELECT rating FROM ratings WHERE user_id = ? AND track_id = ?',
                [req.user.id, trackId]
            );
            userRating = rating?.rating || null;
        }

        res.json({ stats, userRating });
    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

/**
 * POST /api/tracks/:id/like
 * Like a track
 */
router.post('/:id/like', authenticate, [
    body('trackName').optional().trim(),
    body('artistName').optional().trim(),
    body('albumImage').optional()
], (req, res) => {
    try {
        const { trackName, artistName, albumImage } = req.body;
        const trackId = req.params.id;

        try {
            run(`
        INSERT INTO likes (user_id, track_id, track_name, artist_name, album_image)
        VALUES (?, ?, ?, ?, ?)
      `, [req.user.id, trackId, trackName, artistName, albumImage]);
        } catch (e) {
            // Already liked, ignore
        }

        res.json({ message: 'Track liked' });
    } catch (error) {
        console.error('Like track error:', error);
        res.status(500).json({ error: 'Failed to like track' });
    }
});

/**
 * DELETE /api/tracks/:id/like
 * Unlike a track
 */
router.delete('/:id/like', authenticate, (req, res) => {
    try {
        run('DELETE FROM likes WHERE user_id = ? AND track_id = ?', [req.user.id, req.params.id]);
        res.json({ message: 'Track unliked' });
    } catch (error) {
        console.error('Unlike track error:', error);
        res.status(500).json({ error: 'Failed to unlike track' });
    }
});

/**
 * GET /api/tracks/:id/reviews
 * Get reviews for a track
 */
router.get('/:id/reviews', optionalAuth, (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const reviews = query(`
      SELECT r.*, u.username, u.display_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.track_id = ?
      ORDER BY r.likes_count DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.params.id, Number(limit), Number(offset)]);

        res.json({ reviews });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * POST /api/tracks/:id/review
 * Write a review
 */
router.post('/:id/review', authenticate, [
    body('content').trim().isLength({ min: 10, max: 2000 }),
    body('rating').optional().isFloat({ min: 0.5, max: 5 }),
    body('trackName').optional().trim(),
    body('artistName').optional().trim(),
    body('albumImage').optional(),
    body('isSpoiler').optional().isBoolean()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, rating, trackName, artistName, albumImage, isSpoiler } = req.body;
        const trackId = req.params.id;

        const result = run(`
      INSERT INTO reviews (user_id, track_id, track_name, artist_name, album_image, content, rating, is_spoiler)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, trackId, trackName, artistName, albumImage, content, rating, isSpoiler ? 1 : 0]);

        // Create activity
        run(`
      INSERT INTO activities (user_id, type, target_type, target_id, target_name, metadata)
      VALUES (?, 'review', 'track', ?, ?, ?)
    `, [req.user.id, trackId, trackName, JSON.stringify({ rating, artistName, albumImage })]);

        // Get created review
        const review = queryOne(`
      SELECT r.*, u.username, u.display_name, u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [result.lastInsertRowid]);

        res.status(201).json({ review });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

/**
 * DELETE /api/tracks/reviews/:id
 * Delete a review
 */
router.delete('/reviews/:id', authenticate, (req, res) => {
    try {
        const reviewId = req.params.id;

        // Check ownership
        const review = queryOne('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Cannot delete this review' });
        }

        run('DELETE FROM reviews WHERE id = ?', [reviewId]);

        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;
