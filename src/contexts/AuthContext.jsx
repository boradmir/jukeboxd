import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AuthContext = createContext(null);

const STORAGE_KEY = 'jukeboxd_auth';

/**
 * Load auth state from localStorage
 */
function loadAuthState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const { token, user } = JSON.parse(stored);
            return { token, user, isAuthenticated: true };
        }
    } catch (error) {
        console.warn('Error loading auth state:', error);
    }
    return { token: null, user: null, isAuthenticated: false };
}

/**
 * Save auth state to localStorage
 */
function saveAuthState(token, user) {
    try {
        if (token && user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch (error) {
        console.warn('Error saving auth state:', error);
    }
}

export function AuthProvider({ children }) {
    const [state, setState] = useState(() => loadAuthState());
    const [isLoading, setIsLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        async function verifyToken() {
            if (state.token) {
                try {
                    const response = await fetch(`${API_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${state.token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setState({ token: state.token, user: data.user, isAuthenticated: true });
                    } else {
                        // Token invalid, clear state
                        setState({ token: null, user: null, isAuthenticated: false });
                        saveAuthState(null, null);
                    }
                } catch (error) {
                    console.error('Auth verification error:', error);
                }
            }
            setIsLoading(false);
        }

        verifyToken();
    }, []);

    /**
     * Register a new user
     */
    const register = useCallback(async (username, email, password, displayName) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, displayName })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.errors?.[0]?.msg || 'Registration failed');
        }

        const { token, user } = data;
        setState({ token, user, isAuthenticated: true });
        saveAuthState(token, user);

        return user;
    }, []);

    /**
     * Login user
     */
    const login = useCallback(async (email, password) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Check if account is suspended
            if (response.status === 403 && data.error === 'Account is deactivated') {
                const error = new Error('ACCOUNT_SUSPENDED');
                error.isSuspended = true;
                throw error;
            }
            throw new Error(data.error || 'Login failed');
        }

        const { token, user } = data;
        setState({ token, user, isAuthenticated: true });
        saveAuthState(token, user);

        return user;
    }, []);

    /**
     * Logout user
     */
    const logout = useCallback(() => {
        setState({ token: null, user: null, isAuthenticated: false });
        saveAuthState(null, null);
    }, []);

    /**
     * Update user profile
     */
    const updateProfile = useCallback(async (updates) => {
        if (!state.token || !state.user) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/api/users/${state.user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile');
        }

        const updatedUser = { ...state.user, ...data.user };
        setState(prev => ({ ...prev, user: updatedUser }));
        saveAuthState(state.token, updatedUser);

        return updatedUser;
    }, [state.token, state.user]);

    /**
     * Make authenticated API request
     */
    const authFetch = useCallback(async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (state.token) {
            headers['Authorization'] = `Bearer ${state.token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Handle 401 - token expired
        if (response.status === 401) {
            logout();
            throw new Error('Session expired');
        }

        return response;
    }, [state.token, logout]);

    const value = {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading,
        isAdmin: state.user?.role === 'admin',
        isGold: state.user?.is_gold === 1 || state.user?.is_gold === true,
        goldExpiresAt: state.user?.gold_expires_at,
        register,
        login,
        logout,
        updateProfile,
        authFetch
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
