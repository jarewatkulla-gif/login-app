import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  last_login_at: string | null;
  login_count: number;
};

// On Vercel only /tmp is writable (and it is wiped on restart): use Postgres for real data there.
const dataDir =
  process.env.DATA_DIR ?? (process.env.VERCEL ? "/tmp/data" : path.join(process.cwd(), "data"));

declare global {
  // eslint-disable-next-line no-var
  var __db: DatabaseSync | undefined;
}

function open(): DatabaseSync {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "app.db"));
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  // Login status columns (added later; migrate older databases in place).
  const cols = (db.prepare("PRAGMA table_info(users)").all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes("last_login_at")) db.exec("ALTER TABLE users ADD COLUMN last_login_at TEXT");
  if (!cols.includes("login_count")) db.exec("ALTER TABLE users ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0");
  return db;
}

// Open lazily (not at import time) and reuse one connection across hot reloads.
function getDb(): DatabaseSync {
  return (globalThis.__db ??= open());
}

export function findUserByEmail(email: string): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(name: string, email: string, passwordHash: string): number {
  const res = getDb()
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name, email, passwordHash);
  return Number(res.lastInsertRowid);
}

export function recordLogin(id: number) {
  getDb()
    .prepare("UPDATE users SET last_login_at = datetime('now'), login_count = login_count + 1 WHERE id = ?")
    .run(id);
}

export function countUsers(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  return Number(row.n);
}
