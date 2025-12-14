// Spotify API Service
// Uses BACKEND PROXY for secure API calls (client secret not exposed)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Make request to Spotify via backend proxy
 */
async function spotifyFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}/api/spotify${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Spotify API request failed:', error);
        return null;
    }
}

/**
 * Search for tracks, albums, or artists
 */
export async function searchSpotify(query, type = 'track', limit = 20) {
    return await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
}

/**
 * Get track details by ID
 */
export async function getTrack(trackId) {
    return await spotifyFetch(`/tracks/${trackId}`);
}

/**
 * Get multiple tracks
 */
export async function getTracks(trackIds) {
    return await spotifyFetch(`/tracks?ids=${trackIds.join(',')}`);
}

/**
 * Get album details by ID
 */
export async function getAlbum(albumId) {
    return await spotifyFetch(`/albums/${albumId}`);
}

/**
 * Get artist details by ID
 */
export async function getArtist(artistId) {
    return await spotifyFetch(`/artists/${artistId}`);
}

/**
 * Get artist's top tracks
 */
export async function getArtistTopTracks(artistId, market = 'US') {
    return await spotifyFetch(`/artists/${artistId}/top-tracks?market=${market}`);
}

/**
 * Get new releases
 */
export async function getNewReleases(limit = 20, country = 'US') {
    return await spotifyFetch(`/new-releases?limit=${limit}&country=${country}`);
}

/**
 * Get featured playlists
 */
export async function getFeaturedPlaylists(limit = 20) {
    return await spotifyFetch(`/featured-playlists?limit=${limit}`);
}

/**
 * Get playlist details
 */
export async function getPlaylist(playlistId) {
    return await spotifyFetch(`/playlists/${playlistId}`);
}

/**
 * Get categories
 */
export async function getCategories(limit = 20) {
    return await spotifyFetch(`/categories?limit=${limit}`);
}

/**
 * Get recommendations based on seed tracks, artists, or genres
 */
export async function getRecommendations(options = {}) {
    const params = new URLSearchParams();

    if (options.seedTracks) params.append('seed_tracks', options.seedTracks.join(','));
    if (options.seedArtists) params.append('seed_artists', options.seedArtists.join(','));
    if (options.seedGenres) params.append('seed_genres', options.seedGenres.join(','));
    params.append('limit', options.limit || 20);

    return await spotifyFetch(`/recommendations?${params.toString()}`);
}

/**
 * Check if Spotify API is configured (via backend)
 */
export async function isSpotifyConfigured() {
    try {
        const response = await fetch(`${API_URL}/api/spotify/status`);
        const data = await response.json();
        return data.configured;
    } catch {
        return false;
    }
}

export default {
    searchSpotify,
    getTrack,
    getTracks,
    getAlbum,
    getArtist,
    getArtistTopTracks,
    getNewReleases,
    getFeaturedPlaylists,
    getPlaylist,
    getCategories,
    getRecommendations,
    isSpotifyConfigured
};
