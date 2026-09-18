import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '..', 'bot.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS seen_issues (
    repo TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    title TEXT,
    url TEXT,
    seen_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (repo, issue_number)
  );

  CREATE TABLE IF NOT EXISTS branches (
    repo TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    issue_number INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (repo, branch_name)
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export function isIssueSeen(repo, issueNumber) {
  return !!db
    .prepare('SELECT 1 FROM seen_issues WHERE repo = ? AND issue_number = ?')
    .get(repo, issueNumber);
}

export function markIssueSeen(repo, issueNumber, title, url) {
  db.prepare(
    'INSERT OR IGNORE INTO seen_issues (repo, issue_number, title, url) VALUES (?, ?, ?, ?)'
  ).run(repo, issueNumber, title, url);
}

export function recordBranch(repo, branchName, issueNumber) {
  db.prepare(
    'INSERT OR REPLACE INTO branches (repo, branch_name, issue_number) VALUES (?, ?, ?)'
  ).run(repo, branchName, issueNumber ?? null);
}

export function listBranches(limit = 10) {
  return db
    .prepare('SELECT * FROM branches ORDER BY created_at DESC LIMIT ?')
    .all(limit);
}

export function logActivity(kind, message) {
  db.prepare('INSERT INTO activity_log (kind, message) VALUES (?, ?)').run(kind, message);
}

export function recentActivity(limit = 15) {
  return db
    .prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?')
    .all(limit);
}

export default db;
