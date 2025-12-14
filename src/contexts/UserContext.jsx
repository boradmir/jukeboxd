import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * User Context
 * Manages user state across the application:
 * - Liked songs
 * - User ratings
 * - User's lists
 * - Authentication state (placeholder)
 */

const UserContext = createContext(null);

// Local storage keys
const STORAGE_KEYS = {
    LIKED_SONGS: 'jukeboxd_liked_songs',
    RATINGS: 'jukeboxd_ratings',
    USER_LISTS: 'jukeboxd_user_lists',
};

// Helper to safely parse JSON from localStorage
function safeJsonParse(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error parsing ${key} from localStorage:`, error);
        return defaultValue;
    }
}

export function UserProvider({ children }) {
    // Liked songs as a Set (stored as array in localStorage)
    const [likedSongs, setLikedSongs] = useState(() =>
        new Set(safeJsonParse(STORAGE_KEYS.LIKED_SONGS, []))
    );

    // Ratings as an object { trackId: rating }
    const [ratings, setRatings] = useState(() =>
        safeJsonParse(STORAGE_KEYS.RATINGS, {})
    );

    // User's custom lists
    const [userLists, setUserLists] = useState(() =>
        safeJsonParse(STORAGE_KEYS.USER_LISTS, [])
    );

    // User profile (placeholder for auth)
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Persist liked songs to localStorage
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEYS.LIKED_SONGS,
            JSON.stringify([...likedSongs])
        );
    }, [likedSongs]);

    // Persist ratings to localStorage
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEYS.RATINGS,
            JSON.stringify(ratings)
        );
    }, [ratings]);

    // Persist user lists to localStorage
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEYS.USER_LISTS,
            JSON.stringify(userLists)
        );
    }, [userLists]);

    // ===== Like Actions =====
    const toggleLike = useCallback((songId) => {
        setLikedSongs(prev => {
            const next = new Set(prev);
            if (next.has(songId)) {
                next.delete(songId);
            } else {
                next.add(songId);
            }
            return next;
        });
    }, []);

    const isLiked = useCallback((songId) => {
        return likedSongs.has(songId);
    }, [likedSongs]);

    const getLikedCount = useCallback(() => {
        return likedSongs.size;
    }, [likedSongs]);

    // ===== Rating Actions =====
    const setRating = useCallback((songId, rating) => {
        setRatings(prev => ({
            ...prev,
            [songId]: rating
        }));
    }, []);

    const getRating = useCallback((songId) => {
        return ratings[songId] || 0;
    }, [ratings]);

    const removeRating = useCallback((songId) => {
        setRatings(prev => {
            const next = { ...prev };
            delete next[songId];
            return next;
        });
    }, []);

    const getRatingsCount = useCallback(() => {
        return Object.keys(ratings).length;
    }, [ratings]);

    const getAverageRating = useCallback(() => {
        const values = Object.values(ratings);
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }, [ratings]);

    // ===== List Actions =====
    const createList = useCallback((name, description = '') => {
        const newList = {
            id: `list_${Date.now()}`,
            name,
            description,
            tracks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setUserLists(prev => [newList, ...prev]);
        return newList;
    }, []);

    const deleteList = useCallback((listId) => {
        setUserLists(prev => prev.filter(list => list.id !== listId));
    }, []);

    const addToList = useCallback((listId, track) => {
        setUserLists(prev => prev.map(list => {
            if (list.id === listId) {
                // Check if track already exists
                if (list.tracks.some(t => t.id === track.id)) {
                    return list;
                }
                return {
                    ...list,
                    tracks: [...list.tracks, track],
                    updatedAt: new Date().toISOString(),
                };
            }
            return list;
        }));
    }, []);

    const removeFromList = useCallback((listId, trackId) => {
        setUserLists(prev => prev.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    tracks: list.tracks.filter(t => t.id !== trackId),
                    updatedAt: new Date().toISOString(),
                };
            }
            return list;
        }));
    }, []);

    const getList = useCallback((listId) => {
        return userLists.find(list => list.id === listId);
    }, [userLists]);

    // ===== Auth Actions (Placeholder) =====
    const login = useCallback((userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // ===== Stats =====
    const getStats = useCallback(() => {
        return {
            totalLikes: getLikedCount(),
            totalRatings: getRatingsCount(),
            averageRating: getAverageRating(),
            totalLists: userLists.length,
        };
    }, [getLikedCount, getRatingsCount, getAverageRating, userLists.length]);

    const value = {
        // State
        likedSongs,
        ratings,
        userLists,
        user,
        isAuthenticated,

        // Like actions
        toggleLike,
        isLiked,
        getLikedCount,

        // Rating actions
        setRating,
        getRating,
        removeRating,
        getRatingsCount,
        getAverageRating,

        // List actions
        createList,
        deleteList,
        addToList,
        removeFromList,
        getList,

        // Auth actions
        login,
        logout,

        // Stats
        getStats,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Custom hook to use the UserContext
 * @throws Error if used outside of UserProvider
 */
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

export default UserContext;
