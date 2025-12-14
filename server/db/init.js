import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const DB_PATH = join(__dirname, 'jukeboxd.db');

let db = null;

/**
 * Save database to file
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        writeFileSync(DB_PATH, buffer);
    }
}

/**
 * Initialize database
 */
export async function initDatabase() {
    console.log('Initializing database...');

    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (existsSync(DB_PATH)) {
        const fileBuffer = readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('Created new database');

        // Read and execute schema
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        db.run(schema);
        console.log('Database schema created successfully!');

        // Save database
        saveDatabase();
    }

    // Run migrations for existing databases
    await runMigrations();

    // Always check and fix admin user on every server start
    await createDefaultAdmin();

    // Auto-save every 30 seconds
    setInterval(saveDatabase, 30000);

    // Save on exit
    process.on('exit', saveDatabase);
    process.on('SIGINT', () => { saveDatabase(); process.exit(); });
    process.on('SIGTERM', () => { saveDatabase(); process.exit(); });

    return db;
}

/**
 * Run database migrations for existing databases
 */
async function runMigrations() {
    console.log('🔄 Running database migrations...');

    // Check if is_gold column exists in users table
    const tableInfo = db.exec("PRAGMA table_info(users)");
    const columns = tableInfo[0]?.values?.map(row => row[1]) || [];
    console.log('   Current user columns:', columns.join(', '));

    // Add missing columns
    if (!columns.includes('is_gold')) {
        console.log('   ➕ Adding is_gold column...');
        db.run("ALTER TABLE users ADD COLUMN is_gold BOOLEAN DEFAULT 0");
    }

    if (!columns.includes('gold_expires_at')) {
        console.log('   ➕ Adding gold_expires_at column...');
        db.run("ALTER TABLE users ADD COLUMN gold_expires_at DATETIME");
    }

    if (!columns.includes('phone')) {
        console.log('   ➕ Adding phone column...');
        db.run("ALTER TABLE users ADD COLUMN phone TEXT");
    }

    if (!columns.includes('is_active')) {
        console.log('   ➕ Adding is_active column...');
        db.run("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1");
    }

    // Check for new tables
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables[0]?.values?.map(row => row[0]) || [];

    if (!tableNames.includes('audit_logs')) {
        console.log('   ➕ Creating audit_logs table...');
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            admin_username TEXT NOT NULL,
            action TEXT NOT NULL,
            target_type TEXT,
            target_id TEXT,
            target TEXT,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }

    if (!tableNames.includes('notifications')) {
        console.log('   ➕ Creating notifications table...');
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            target_group TEXT DEFAULT 'all',
            sent_by INTEGER,
            sent_count INTEGER DEFAULT 0,
            read_count INTEGER DEFAULT 0,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }

    if (!tableNames.includes('site_settings')) {
        console.log('   ➕ Creating site_settings table...');
        db.run(`CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }

    saveDatabase();
    console.log('✅ Migrations complete!');
}

/**
 * Create default admin user or fix admin role
 */
async function createDefaultAdmin() {
    console.log('🔍 Checking admin user...');

    // Check if admin@jukeboxd.com user exists
    const existingAdmin = db.exec("SELECT id, role FROM users WHERE email = 'admin@jukeboxd.com'");

    if (existingAdmin.length > 0 && existingAdmin[0].values.length > 0) {
        const [id, role] = existingAdmin[0].values[0];
        console.log(`   Found admin user (id: ${id}, current role: ${role})`);

        // ALWAYS force admin role on server start
        db.run("UPDATE users SET role = 'admin' WHERE email = 'admin@jukeboxd.com'");
        console.log('✅ Admin role ensured for admin@jukeboxd.com');
        saveDatabase();
    } else {
        // Create new admin user
        console.log('   Creating new admin user...');
        const passwordHash = bcrypt.hashSync('admin123', 10);

        db.run(`
      INSERT INTO users (username, email, password_hash, display_name, role)
      VALUES (?, ?, ?, ?, ?)
    `, ['admin', 'admin@jukeboxd.com', passwordHash, 'Admin', 'admin']);

        console.log('✅ Default admin user created (admin@jukeboxd.com / admin123)');
        saveDatabase();
    }
}

/**
 * Get database instance
 */
export function getDb() {
    return db;
}

/**
 * Execute SQL and return results in a clean format
 */
export function query(sql, params = []) {
    try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
            stmt.bind(params);
        }

        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push(row);
        }
        stmt.free();
        return results;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
}

/**
 * Execute SQL and get first result
 */
export function queryOne(sql, params = []) {
    const results = query(sql, params);
    return results[0] || null;
}

/**
 * Execute INSERT/UPDATE/DELETE and return changes info
 */
export function run(sql, params = []) {
    try {
        db.run(sql, params);
        const changes = db.getRowsModified();
        const lastId = query("SELECT last_insert_rowid() as id")[0]?.id;
        saveDatabase(); // Save after modifications
        return { changes, lastInsertRowid: lastId };
    } catch (error) {
        console.error('Run error:', error.message);
        throw error;
    }
}

export default { getDb, query, queryOne, run, initDatabase };
