import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import nodemailer from 'nodemailer';

export const SESSION_COOKIE = 'suitme_session';
export const SESSION_DAYS = 30;
const RESET_TTL_MS = 3_600_000;
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://suitme.pierref.eu';
export const USERNAME_RE = /^[A-Za-z0-9._-]{3,32}$/;

let database: DatabaseSync | null = null;

export function db() {
  if (database) return database;
  const path = process.env.SUITME_DB || './data/suitme.db';
  mkdirSync(dirname(path), { recursive: true });
  database = new DatabaseSync(path);
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS account (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      pw_hash TEXT NOT NULL, email TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS session (token_hash TEXT PRIMARY KEY, account_id INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS password_reset (token_hash TEXT PRIMARY KEY, account_id INTEGER NOT NULL,
      expires INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
  `);
  return database;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;
}

export function checkPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  return timingSafeEqual(scryptSync(password, Buffer.from(salt, 'hex'), expected.length), expected);
}

export function createSession(accountId: number) {
  const token = randomBytes(32).toString('base64url');
  db().prepare('INSERT INTO session (token_hash, account_id, expires) VALUES (?, ?, ?)')
    .run(sha256(token), accountId, Date.now() + SESSION_DAYS * 86_400_000);
  return token;
}

export function deleteSession(token: string) {
  db().prepare('DELETE FROM session WHERE token_hash = ?').run(sha256(token));
}

/** The logged-in account for this request, read from the session cookie. */
export function currentAccount(request: Request) {
  const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (!token) return null;
  const row = db().prepare('SELECT a.id, a.username, a.email FROM session s JOIN account a ON a.id = s.account_id '
    + 'WHERE s.token_hash = ? AND s.expires > ?').get(sha256(token), Date.now()) as { id: number; username: string; email: string | null } | undefined;
  return row ?? null;
}

export function sessionCookie(token: string, maxAgeSeconds = SESSION_DAYS * 86_400) {
  const secure = PUBLIC_URL.startsWith('https://') ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export async function sendMail(to: string, subject: string, text: string) {
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  if (!user || !pass) {
    console.warn('[SuitMe mail] MAIL_USERNAME/MAIL_PASSWORD not set, mail not sent');
    return false;
  }
  const transport = nodemailer.createTransport({
    host: process.env.MAIL_SERVER || 'ssl0.ovh.net',
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT || 587) === 465,
    auth: { user, pass },
  });
  try {
    await transport.sendMail({ from: `SuitMe <${user}>`, to, subject, text });
    return true;
  } catch (cause) {
    console.error('[SuitMe mail] send failed', cause instanceof Error ? cause.message : cause);
    return false;
  }
}

/** Creates a reset link and mails it. Silent when the account has no e-mail (no account enumeration). */
export async function requestPasswordReset(who: string) {
  const row = db().prepare('SELECT id, username, email FROM account WHERE (username = ? OR email = ? COLLATE NOCASE) AND email IS NOT NULL')
    .get(who, who) as { id: number; username: string; email: string } | undefined;
  if (!row) return;
  const recent = db().prepare('SELECT 1 FROM password_reset WHERE account_id = ? AND expires > ?')
    .get(row.id, Date.now() + RESET_TTL_MS - 120_000);
  if (recent) return; // one mail per 2 minutes per account
  const token = randomBytes(32).toString('base64url');
  db().prepare('INSERT INTO password_reset (token_hash, account_id, expires) VALUES (?, ?, ?)')
    .run(sha256(token), row.id, Date.now() + RESET_TTL_MS);
  await sendMail(row.email, 'SuitMe: choose a new password',
    `Hello ${row.username},\n\nTo choose a new password, open this link (valid for 1 hour):\n${PUBLIC_URL}/account?reset=${token}\n\nIf you did not ask for it, ignore this message: your password does not change.\n`);
}

/** Returns the account id on success, null when the token is unknown, used or expired. */
export function confirmPasswordReset(token: string, password: string) {
  const row = db().prepare('SELECT account_id FROM password_reset WHERE token_hash = ? AND used = 0 AND expires > ?')
    .get(sha256(token), Date.now()) as { account_id: number } | undefined;
  if (!row) return null;
  db().prepare('UPDATE password_reset SET used = 1 WHERE account_id = ?').run(row.account_id);
  db().prepare('UPDATE account SET pw_hash = ? WHERE id = ?').run(hashPassword(password), row.account_id);
  db().prepare('DELETE FROM session WHERE account_id = ?').run(row.account_id);
  return row.account_id;
}
