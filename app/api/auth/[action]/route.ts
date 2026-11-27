import { NextResponse } from 'next/server';
import {
  checkPassword, confirmPasswordReset, createSession, currentAccount, db, deleteSession, hashPassword,
  requestPasswordReset, SESSION_COOKIE, sessionCookie, USERNAME_RE,
} from '@/lib/auth';
import { clientIp, tooMany } from '@/lib/rateLimit';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

function loggedIn(account: { id: number; username: string }) {
  const response = NextResponse.json({ ok: true, username: account.username });
  response.headers.set('Set-Cookie', sessionCookie(createSession(account.id)));
  return response;
}

export async function GET(request: Request, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== 'me') return fail('Not found', 404);
  const account = currentAccount(request);
  return NextResponse.json({ username: account?.username ?? null, email: account?.email ?? null });
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const text = (key: string, max = 200) => (typeof body[key] === 'string' ? (body[key] as string).trim().slice(0, max) : '');
  const password = typeof body.password === 'string' ? body.password : '';
  const ip = clientIp(request);

  if (action === 'register') {
    const username = text('username', 40);
    const email = text('email');
    if (tooMany(`register:${ip}`, 10, 3_600_000)) return fail('Too many accounts created from this connection. Try again later.', 429);
    if (!USERNAME_RE.test(username)) return fail('Username: 3 to 32 characters, letters, digits, . _ -', 400);
    if (password.length < 8 || password.length > 200) return fail('Password: at least 8 characters.', 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Invalid e-mail address.', 400);
    try {
      const id = Number(db().prepare('INSERT INTO account (username, pw_hash, email) VALUES (?, ?, ?)')
        .run(username, hashPassword(password), email || null).lastInsertRowid);
      return loggedIn({ id, username });
    } catch {
      return fail('This username is taken.', 409);
    }
  }

  if (action === 'login') {
    const username = text('username', 40);
    const userKey = `login-fail:${username.toLowerCase()}`;
    const ipKey = `login-fail-ip:${ip}`;
    if (tooMany(userKey, 10, 900_000, false) || tooMany(ipKey, 50, 900_000, false)) return fail('Too many attempts. Try again in 15 minutes.', 429);
    const row = db().prepare('SELECT id, username, pw_hash FROM account WHERE username = ?').get(username) as { id: number; username: string; pw_hash: string } | undefined;
    if (!row || !checkPassword(password, row.pw_hash)) {
      tooMany(userKey, 10, 900_000); tooMany(ipKey, 50, 900_000);
      return fail('Wrong username or password.', 401);
    }
    return loggedIn(row);
  }

  if (action === 'logout') {
    const token = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))?.[1];
    if (token) deleteSession(token);
    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', sessionCookie('', 0));
    return response;
  }

  if (action === 'email') {
    const account = currentAccount(request);
    if (!account) return fail('Log in first.', 401);
    const email = text('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Invalid e-mail address.', 400);
    db().prepare('UPDATE account SET email = ? WHERE id = ?').run(email || null, account.id);
    return NextResponse.json({ ok: true });
  }

  if (action === 'reset-request') {
    if (tooMany(`reset:${ip}`, 10, 3_600_000)) return fail('Too many requests. Try again in an hour.', 429);
    const who = text('who');
    if (who) await requestPasswordReset(who);
    return NextResponse.json({ ok: true, message: 'If this account has an e-mail address, a link has been sent to it.' });
  }

  if (action === 'reset-confirm') {
    if (password.length < 8 || password.length > 200) return fail('Password: at least 8 characters.', 400);
    const accountId = confirmPasswordReset(text('token'), password);
    if (!accountId) return fail('Link expired or already used. Ask for a new e-mail.', 400);
    const row = db().prepare('SELECT id, username FROM account WHERE id = ?').get(accountId) as { id: number; username: string };
    return loggedIn(row);
  }

  return fail('Not found', 404);
}
