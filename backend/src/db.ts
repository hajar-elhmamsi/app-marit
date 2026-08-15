import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database/maritime.sqlite');

if (!fs.existsSync(dbPath)) {
  console.warn(`[DB] Database file not found at ${dbPath}, initializing...`);
  // Will be created on DatabaseSync instance
}

export const db = new DatabaseSync(dbPath);

console.log(`[DB] Connected to SQLite database: ${dbPath}`);
