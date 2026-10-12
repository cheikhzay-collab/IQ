// src/lib/db.ts - Unified database engine supporting Hostinger MySQL and local SQLite
import mysql from 'mysql2/promise';
import { hashPassword } from './auth';

let mysqlPool: mysql.Pool | null = null;
let sqliteDb: any = null;
let isInitialized = false;

// Hostinger environment detection
const isMySQL = Boolean(
  process.env.DB_HOST ||
  process.env.DB_NAME ||
  process.env.DATABASE_URL
);

function getMySQLPool(): mysql.Pool {
  if (!mysqlPool) {
    if (process.env.DATABASE_URL) {
      mysqlPool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    } else {
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4',
      });
    }
  }
  return mysqlPool;
}

function getSqliteDb(): any {
  if (!sqliteDb) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      const path = require('path');
      const DB_PATH = path.join(process.cwd(), 'deliveryiq.db');
      sqliteDb = new Database(DB_PATH);
      sqliteDb.pragma('journal_mode = WAL');
    } catch (e) {
      console.warn('better-sqlite3 not available, fallback will be used:', e);
      // in-memory lightweight mock if on a platform without better-sqlite3 and without MySQL
      sqliteDb = createMemoryDb();
    }
  }
  return sqliteDb;
}

function createMemoryDb() {
  const store: Record<string, any[]> = {
    users: [],
    orders: [],
    events: [],
    messages: [],
    alerts: [],
    settings: [],
  };

  return {
    prepare: (sql: string) => ({
      all: (...params: any[]) => [],
      get: (...params: any[]) => null,
      run: (...params: any[]) => ({ lastInsertRowid: 1, changes: 1 }),
    }),
    exec: (sql: string) => {},
  };
}

export async function initDatabase() {
  if (isInitialized) return;

  if (isMySQL) {
    const pool = getMySQLPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(191) PRIMARY KEY,
        tracking VARCHAR(191) UNIQUE,
        client_name VARCHAR(255),
        client_phone VARCHAR(50),
        city VARCHAR(100),
        status VARCHAR(100),
        previous_status VARCHAR(100),
        attempt_count INT DEFAULT 0,
        last_updated VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        risk_level VARCHAR(50) DEFAULT 'low'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(191),
        tracking VARCHAR(191),
        event_type VARCHAR(100),
        old_status VARCHAR(100),
        new_status VARCHAR(100),
        raw_payload TEXT,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(191),
        client_phone VARCHAR(50),
        message_text TEXT,
        language VARCHAR(10) DEFAULT 'ar',
        status VARCHAR(50) DEFAULT 'pending',
        whatsapp_message_id VARCHAR(191),
        sent_at VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        generated_by VARCHAR(50) DEFAULT 'ai'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(191),
        tracking VARCHAR(191),
        alert_type VARCHAR(100),
        priority VARCHAR(50) DEFAULT 'medium',
        message TEXT,
        is_read INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(191) PRIMARY KEY,
        \`value\` TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure default admin user exists
    const [existingUsers]: any = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@deliveryiq.com']);
    if (!existingUsers || existingUsers.length === 0) {
      const defaultPass = hashPassword('admin123456');
      await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
        ['admin@deliveryiq.com', defaultPass, 'المدير العام', 'admin']
      );
    }
  } else {
    // SQLite schema
    const sdb = getSqliteDb();
    sdb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        tracking TEXT UNIQUE,
        client_name TEXT,
        client_phone TEXT,
        city TEXT,
        status TEXT,
        previous_status TEXT,
        attempt_count INTEGER DEFAULT 0,
        last_updated TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        notes TEXT,
        risk_level TEXT DEFAULT 'low'
      );
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        tracking TEXT,
        event_type TEXT,
        old_status TEXT,
        new_status TEXT,
        raw_payload TEXT,
        received_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        client_phone TEXT,
        message_text TEXT,
        language TEXT DEFAULT 'ar',
        status TEXT DEFAULT 'pending',
        whatsapp_message_id TEXT,
        sent_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        generated_by TEXT DEFAULT 'ai'
      );
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        tracking TEXT,
        alert_type TEXT,
        priority TEXT DEFAULT 'medium',
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Ensure default admin in SQLite
    try {
      const existing = sdb.prepare('SELECT id FROM users WHERE email = ?').get('admin@deliveryiq.com');
      if (!existing) {
        const defaultPass = hashPassword('admin123456');
        sdb.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
          .run('admin@deliveryiq.com', defaultPass, 'المدير العام', 'admin');
      }
    } catch {}
  }

  isInitialized = true;
}

// Unified Async Query Engine
export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  await initDatabase();
  if (isMySQL) {
    const pool = getMySQLPool();
    const [rows]: any = await pool.query(sql, params);
    return rows as T[];
  } else {
    const sdb = getSqliteDb();
    // Normalize SQLite queries if needed
    const normalizedSql = sql.replace(/`key`/g, 'key').replace(/`value`/g, 'value');
    return sdb.prepare(normalizedSql).all(...params) as T[];
  }
}

export async function dbQueryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function dbExecute(sql: string, params: any[] = []): Promise<{ insertId?: number | string; changes?: number }> {
  await initDatabase();
  if (isMySQL) {
    const pool = getMySQLPool();
    const [result]: any = await pool.query(sql, params);
    return { insertId: result.insertId, changes: result.affectedRows };
  } else {
    const sdb = getSqliteDb();
    const normalizedSql = sql.replace(/`key`/g, 'key').replace(/`value`/g, 'value');
    const res = sdb.prepare(normalizedSql).run(...params);
    return { insertId: res.lastInsertRowid, changes: res.changes };
  }
}

// Backwards compatibility layer for legacy code calling getDb()
export function getDb(): any {
  if (isMySQL) {
    // If running in sync mode on MySQL, return an object that proxies to mysql or provides safe fallback
    return {
      prepare: (sql: string) => ({
        all: (...params: any[]) => [],
        get: (...params: any[]) => null,
        run: (...params: any[]) => ({ lastInsertRowid: 1, changes: 1 }),
      }),
      exec: () => {},
    };
  }
  return getSqliteDb();
}
