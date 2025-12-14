import { useState, useEffect } from 'react';
import { searchSpotify, isSpotifyConfigured } from '../services/spotify';

/**
 * Custom hook for Spotify search with debouncing
 * @param {string} query - Search query
 * @param {string} type - Search type (track, album, artist)
 * @param {number} limit - Results limit
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export function useSpotifySearch(query, type = 'track', limit = 20, debounceMs = 500) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Don't search if query is empty
        if (!query?.trim()) {
            setResults([]);
            setError(null);
            return;
        }

        // Don't search if Spotify is not configured
        if (!isSpotifyConfigured()) {
            setError(new Error('Spotify not configured'));
            return;
        }

        const controller = new AbortController();

        const debounceTimer = setTimeout(async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await searchSpotify(query, type, limit);

                // Check if request was aborted
                if (controller.signal.aborted) return;

                // Extract results based on type
                const typeKey = type === 'track' ? 'tracks' :
                    type === 'album' ? 'albums' :
                        type === 'artist' ? 'artists' : 'tracks';

                setResults(data?.[typeKey]?.items || []);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err);
                    setResults([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, debounceMs);

        // Cleanup
        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [query, type, limit, debounceMs]);

    return { results, isLoading, error };
}

/**
 * Custom hook for local storage state
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value if key doesn't exist
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting ${key} in localStorage:`, error);
        }
    };

    return [storedValue, setValue];
}

/**
 * Custom hook for debounced value
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook for media query
 * @param {string} query - Media query string
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        const handleChange = (e) => {
            setMatches(e.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, [query]);

    return matches;
}

/**
 * Predefined media query hooks
 */
export function useIsMobile() {
    return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
    return useMediaQuery('(max-width: 1024px)');
}

export function useIsDesktop() {
    return useMediaQuery('(min-width: 1025px)');
}

/**
 * Custom hook for tracking scroll position
 */
export function useScrollPosition() {
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollPosition;
}

/**
 * Custom hook for tracking if element is in viewport
 * @param {RefObject} ref - React ref to the element
 * @param {string} rootMargin - Intersection observer root margin
 */
export function useInView(ref, rootMargin = '0px') {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, rootMargin]);

    return isInView;
}
