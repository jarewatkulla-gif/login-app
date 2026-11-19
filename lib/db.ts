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
};

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

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

export function countUsers(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  return Number(row.n);
}
