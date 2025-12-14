import express from 'express';

const router = express.Router();

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Credentials from environment (secure - server-side only)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Token cache
let accessToken = null;
let tokenExpiry = null;

/**
 * Get Spotify access token (server-side, secure)
 */
async function getAccessToken() {
    // Return cached token if still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn('Spotify credentials not configured');
        return null;
    }

    try {
        const response = await fetch(SPOTIFY_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        return accessToken;
    } catch (error) {
        console.error('Error getting Spotify access token:', error);
        return null;
    }
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyFetch(endpoint) {
    const token = await getAccessToken();

    if (!token) {
        return null;
    }

    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * @route GET /api/spotify/search
 * @desc Search Spotify
 */
router.get('/search', async (req, res) => {
    try {
        const { q, type = 'track', limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        const data = await spotifyFetch(
            `/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`
        );

        if (!data) {
            return res.status(503).json({ error: 'Spotify service unavailable' });
        }

        res.json(data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * @route GET /api/spotify/tracks/:id
 * @desc Get track by ID
 */
router.get('/tracks/:id', async (req, res) => {
    try {
        const data = await spotifyFetch(`/tracks/${req.params.id}`);

        if (!data) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get track error:', error);
        res.status(500).json({ error: 'Failed to get track' });
    }
});

/**
 * @route GET /api/spotify/albums/:id
 * @desc Get album by ID
 */
router.get('/albums/:id', async (req, res) => {
    try {
        const data = await spotifyFetch(`/albums/${req.params.id}`);

        if (!data) {
            return res.status(404).json({ error: 'Album not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get album error:', error);
        res.status(500).json({ error: 'Failed to get album' });
    }
});

/**
 * @route GET /api/spotify/artists/:id
 * @desc Get artist by ID
 */
router.get('/artists/:id', async (req, res) => {
    try {
        const data = await spotifyFetch(`/artists/${req.params.id}`);

        if (!data) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get artist error:', error);
        res.status(500).json({ error: 'Failed to get artist' });
    }
});

/**
 * @route GET /api/spotify/artists/:id/top-tracks
 * @desc Get artist's top tracks
 */
router.get('/artists/:id/top-tracks', async (req, res) => {
    try {
        const market = req.query.market || 'US';
        const data = await spotifyFetch(`/artists/${req.params.id}/top-tracks?market=${market}`);

        if (!data) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get top tracks error:', error);
        res.status(500).json({ error: 'Failed to get top tracks' });
    }
});

/**
 * @route GET /api/spotify/new-releases
 * @desc Get new releases
 */
router.get('/new-releases', async (req, res) => {
    try {
        const { limit = 20, country = 'US' } = req.query;
        const data = await spotifyFetch(`/browse/new-releases?limit=${limit}&country=${country}`);

        if (!data) {
            return res.status(503).json({ error: 'Spotify service unavailable' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get new releases error:', error);
        res.status(500).json({ error: 'Failed to get new releases' });
    }
});

/**
 * @route GET /api/spotify/recommendations
 * @desc Get recommendations
 */
router.get('/recommendations', async (req, res) => {
    try {
        const { seed_tracks, seed_artists, seed_genres, limit = 20 } = req.query;

        const params = new URLSearchParams();
        if (seed_tracks) params.append('seed_tracks', seed_tracks);
        if (seed_artists) params.append('seed_artists', seed_artists);
        if (seed_genres) params.append('seed_genres', seed_genres);
        params.append('limit', limit);

        const data = await spotifyFetch(`/recommendations?${params.toString()}`);

        if (!data) {
            return res.status(503).json({ error: 'Spotify service unavailable' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

/**
 * @route GET /api/spotify/status
 * @desc Check if Spotify API is configured
 */
router.get('/status', (req, res) => {
    res.json({
        configured: !!(CLIENT_ID && CLIENT_SECRET),
        message: CLIENT_ID && CLIENT_SECRET
            ? 'Spotify API configured'
            : 'Spotify credentials not set'
    });
});

export default router;
