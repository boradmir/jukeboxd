import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/init.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import trackRoutes from './routes/tracks.js';
import playlistRoutes from './routes/playlists.js';
import activityRoutes from './routes/activities.js';
import adminRoutes from './routes/admin.js';
import spotifyRoutes from './routes/spotify.js';
import subscriptionRoutes from './routes/subscription.js';
import referralRoutes from './routes/referrals.js';
import badgeRoutes from './routes/badges.js';

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}

// Initialize database
initDatabase();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
// Helmet-like security headers
app.use((req, res, next) => {
    // Prevent XSS attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Prevent clickjacking
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    // HSTS (HTTP Strict Transport Security)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting (simple in-memory implementation)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
        const record = rateLimit.get(ip);
        if (now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + RATE_LIMIT_WINDOW;
        } else {
            record.count++;
            if (record.count > RATE_LIMIT_MAX) {
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil((record.resetTime - now) / 1000)
                });
            }
        }
    }
    next();
});

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimit.entries()) {
        if (now > record.resetTime) {
            rateLimit.delete(ip);
        }
    }
}, 5 * 60 * 1000);

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Public SEO settings (no auth required)
app.get('/api/settings/seo', async (req, res) => {
    try {
        const { query } = await import('./db/init.js');
        const settingsArray = query('SELECT * FROM site_settings WHERE key LIKE ?', ['seo_%']);
        const settings = {};
        settingsArray.forEach(s => {
            // Remove 'seo_' prefix for cleaner output
            const key = s.key.replace('seo_', '');
            settings[key] = s.value;
        });

        // Also get general settings needed for SEO
        const generalSettings = query('SELECT * FROM site_settings WHERE key IN (?, ?, ?)',
            ['site_name', 'site_description', 'site_url']);
        generalSettings.forEach(s => {
            settings[s.key] = s.value;
        });

        res.json(settings);
    } catch (error) {
        console.error('SEO settings error:', error);
        res.json({
            site_name: 'Jukeboxd',
            site_description: 'Müzik tutkunları için sosyal platform'
        });
    }
});

// Robots.txt
app.get('/robots.txt', async (req, res) => {
    try {
        const { queryOne } = await import('./db/init.js');
        const setting = queryOne('SELECT value FROM site_settings WHERE key = ?', ['seo_robots_txt']);
        const robotsTxt = setting?.value || `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://jukeboxd.com/sitemap.xml`;

        res.type('text/plain').send(robotsTxt);
    } catch (error) {
        res.type('text/plain').send('User-agent: *\nAllow: /');
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/badges', badgeRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(err.status || 500).json({ error: message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Jukeboxd API running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});
