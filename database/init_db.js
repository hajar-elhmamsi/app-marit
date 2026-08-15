// Automated SQLite Database Initialization Script using Node.js built-in sqlite module
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'maritime.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');

console.log('--- NAVIOS MARITIME OS DATABASE INITIALIZATION ---');

// Delete existing database file if present for clean seeding
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ Cleaned existing database file:', dbPath);
}

const db = new DatabaseSync(dbPath);
console.log('✓ Created SQLite database at:', dbPath);

// Execute Schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('✓ Executed schema.sql (10 tables created)');

// Execute Seeds
const seedSql = fs.readFileSync(seedPath, 'utf8');
db.exec(seedSql);
console.log('✓ Executed seed.sql (Fleet, Ports, Crew, Cargo, Alarms seeded)');

console.log('--- DATABASE READY ---');
