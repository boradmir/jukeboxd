import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, run } from '../db/init.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/playlists
 * List playlists
 */
router.get('/', optionalAuth, (req, res) => {
    try {
        const { user_id, search, sort = 'popular', limit = 20, offset = 0 } = req.query;

        let sql = `
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = 1
    `;
        const params = [];

        if (user_id) {
            sql += ` AND p.user_id = ?`;
            params.push(user_id);
        }

        if (search) {
            sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (sort === 'popular') {
            sql += ` ORDER BY p.likes_count DESC, p.created_at DESC`;
        } else {
            sql += ` ORDER BY p.created_at DESC`;
        }

        sql += ` LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const playlists = query(sql, params);

        res.json({ playlists });
    } catch (error) {
        console.error('List playlists error:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

/**
 * GET /api/playlists/:id
 * Get playlist details
 */
router.get('/:id', optionalAuth, (req, res) => {
    try {
        const playlist = queryOne(`
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (!playlist.is_public && (!req.user || req.user.id !== playlist.user_id)) {
            return res.status(403).json({ error: 'Private playlist' });
        }

        // Get tracks
        playlist.tracks = query(`
      SELECT track_id, track_name, artist_name, album_image, duration_ms, position, added_at
      FROM playlist_tracks
      WHERE playlist_id = ?
      ORDER BY position
    `, [req.params.id]);

        res.json({ playlist });
    } catch (error) {
        console.error('Get playlist error:', error);
        res.status(500).json({ error: 'Failed to fetch playlist' });
    }
});

/**
 * POST /api/playlists
 * Create a new playlist
 */
router.post('/', authenticate, [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('isPublic').optional().isBoolean()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, isPublic = true } = req.body;

        const result = run(`
      INSERT INTO playlists (user_id, name, description, is_public)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, name, description, isPublic ? 1 : 0]);

        const playlist = queryOne('SELECT * FROM playlists WHERE id = ?', [result.lastInsertRowid]);

        res.status(201).json({ playlist });
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

/**
 * PUT /api/playlists/:id
 * Update a playlist
 */
router.put('/:id', authenticate, [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('isPublic').optional().isBoolean()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const playlist = queryOne('SELECT user_id FROM playlists WHERE id = ?', [req.params.id]);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Cannot edit this playlist' });
        }

        const { name, description, isPublic } = req.body;

        if (name) run('UPDATE playlists SET name = ? WHERE id = ?', [name, req.params.id]);
        if (description !== undefined) run('UPDATE playlists SET description = ? WHERE id = ?', [description, req.params.id]);
        if (isPublic !== undefined) run('UPDATE playlists SET is_public = ? WHERE id = ?', [isPublic ? 1 : 0, req.params.id]);

        const updated = queryOne('SELECT * FROM playlists WHERE id = ?', [req.params.id]);

        res.json({ playlist: updated });
    } catch (error) {
        console.error('Update playlist error:', error);
        res.status(500).json({ error: 'Failed to update playlist' });
    }
});

/**
 * DELETE /api/playlists/:id
 * Delete a playlist
 */
router.delete('/:id', authenticate, (req, res) => {
    try {
        const playlist = queryOne('SELECT user_id FROM playlists WHERE id = ?', [req.params.id]);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Cannot delete this playlist' });
        }

        run('DELETE FROM playlists WHERE id = ?', [req.params.id]);

        res.json({ message: 'Playlist deleted' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

/**
 * POST /api/playlists/:id/tracks
 * Add track to playlist
 */
router.post('/:id/tracks', authenticate, [
    body('trackId').notEmpty(),
    body('trackName').optional().trim(),
    body('artistName').optional().trim(),
    body('albumImage').optional(),
    body('durationMs').optional().isInt()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const playlist = queryOne('SELECT user_id FROM playlists WHERE id = ?', [req.params.id]);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Cannot add to this playlist' });
        }

        const { trackId, trackName, artistName, albumImage, durationMs } = req.body;

        // Get next position
        const lastTrack = queryOne(
            'SELECT MAX(position) as max_pos FROM playlist_tracks WHERE playlist_id = ?',
            [req.params.id]
        );
        const position = (lastTrack?.max_pos || 0) + 1;

        try {
            run(`
        INSERT INTO playlist_tracks (playlist_id, track_id, track_name, artist_name, album_image, duration_ms, position)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [req.params.id, trackId, trackName, artistName, albumImage, durationMs, position]);
        } catch (e) {
            // Already exists, ignore
        }

        res.json({ message: 'Track added to playlist' });
    } catch (error) {
        console.error('Add track error:', error);
        res.status(500).json({ error: 'Failed to add track' });
    }
});

/**
 * DELETE /api/playlists/:id/tracks/:trackId
 * Remove track from playlist
 */
router.delete('/:id/tracks/:trackId', authenticate, (req, res) => {
    try {
        const playlist = queryOne('SELECT user_id FROM playlists WHERE id = ?', [req.params.id]);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        if (playlist.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Cannot remove from this playlist' });
        }

        run('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [req.params.id, req.params.trackId]);

        res.json({ message: 'Track removed from playlist' });
    } catch (error) {
        console.error('Remove track error:', error);
        res.status(500).json({ error: 'Failed to remove track' });
    }
});

export default router;
