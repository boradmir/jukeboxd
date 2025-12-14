import jwt from 'jsonwebtoken';
import { queryOne } from '../db/init.js';

// JWT Secret - required in production, has fallback for development
const DEV_SECRET = 'jukeboxd-dev-secret-do-not-use-in-production';
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: JWT_SECRET environment variable is required in production');
        process.exit(1);
    } else {
        console.warn('⚠️ JWT_SECRET not set, using development fallback. DO NOT use in production!');
        JWT_SECRET = DEV_SECRET;
    }
}

export { JWT_SECRET };
export const JWT_EXPIRES_IN = '7d';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = queryOne(`
      SELECT id, username, email, display_name, avatar_url, bio, role, is_active, is_gold, gold_expires_at, created_at
      FROM users WHERE id = ?
    `, [decoded.userId]);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * Optional authentication middleware
 * Attaches user if token provided, but doesn't require it
 */
export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            const user = queryOne(`
        SELECT id, username, email, display_name, avatar_url, bio, role, is_active
        FROM users WHERE id = ? AND is_active = 1
      `, [decoded.userId]);

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Token invalid, continue without user
        next();
    }
}

/**
 * Admin middleware
 * Requires user to be authenticated and have admin role
 */
export function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
