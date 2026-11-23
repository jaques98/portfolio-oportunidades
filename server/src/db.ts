import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

// Caminho relativo ao arquivo, independente da pasta do terminal.
export const defaultDatabasePath = fileURLToPath(
  new URL('../data/portfolio.db', import.meta.url),
);

export function openDatabase(databasePath = defaultDatabasePath): DatabaseSync {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  }
  const db = new DatabaseSync(databasePath);
  try {
    db.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        description TEXT NOT NULL,
        amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
        status TEXT NOT NULL CHECK(status IN ('aberta', 'ganha', 'perdida')),
        created_at TEXT NOT NULL
      ) STRICT;
    `);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
