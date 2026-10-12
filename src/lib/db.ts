// lib/db.ts - SQLite database using better-sqlite3 for simplicity
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'deliveryiq.db');

let db: Database.Database;

import { seedDatabaseIfEmpty } from './seed';

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeSchema(db);
    seedDatabaseIfEmpty();
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
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
}
