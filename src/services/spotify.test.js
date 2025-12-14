import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchSpotify, getTrack, isSpotifyConfigured } from '../services/spotify';

// Mock global fetch
global.fetch = vi.fn();

describe('Spotify Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchSpotify', () => {
        it('should call backend proxy with correct parameters', async () => {
            const mockData = {
                tracks: {
                    items: [{ id: '1', name: 'Test Track' }]
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData)
            });

            const result = await searchSpotify('test query', 'track', 10);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/spotify/search?q=test%20query&type=track&limit=10')
            );
            expect(result).toEqual(mockData);
        });

        it('should return null on error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await searchSpotify('test');

            expect(result).toBeNull();
        });
    });

    describe('getTrack', () => {
        it('should fetch track by ID', async () => {
            const mockTrack = { id: '123', name: 'Test Song' };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockTrack)
            });

            const result = await getTrack('123');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/spotify/tracks/123')
            );
            expect(result).toEqual(mockTrack);
        });
    });

    describe('isSpotifyConfigured', () => {
        it('should return true when backend says configured', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ configured: true })
            });

            const result = await isSpotifyConfigured();

            expect(result).toBe(true);
        });

        it('should return false on error', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Error'));

            const result = await isSpotifyConfigured();

            expect(result).toBe(false);
        });
    });
});
