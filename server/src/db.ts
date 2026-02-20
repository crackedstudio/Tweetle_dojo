import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'tournaments.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY,
        solution TEXT NOT NULL,
        salt TEXT NOT NULL,
        word_index INTEGER NOT NULL,
        commitment TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }
  return db;
}

export interface TournamentRecord {
  id: number;
  solution: string;
  salt: string;
  word_index: number;
  commitment: string;
  created_at: string;
}

export function storeTournament(
  id: number,
  solution: string,
  salt: string,
  wordIndex: number,
  commitment: string,
): void {
  const d = getDb();
  d.prepare(
    `INSERT OR REPLACE INTO tournaments (id, solution, salt, word_index, commitment) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, solution, salt, wordIndex, commitment);
}

export function getTournament(id: number): TournamentRecord | undefined {
  const d = getDb();
  return d.prepare(`SELECT * FROM tournaments WHERE id = ?`).get(id) as
    | TournamentRecord
    | undefined;
}
