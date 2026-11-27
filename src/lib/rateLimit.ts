// shortcut: per-process memory, resets on restart and is not shared across instances; move to Redis if scaled out.
const hits = new Map<string, number[]>();

/** True when `key` already made `limit` hits in the last `windowMs`; otherwise records this hit (unless record=false). */
export function tooMany(key: string, limit: number, windowMs: number, record = true, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  const blocked = recent.length >= limit;
  if (!blocked && record) recent.push(now);
  hits.set(key, recent);
  return blocked;
}

export function clientIp(request: Request) {
  // Caddy sets X-Forwarded-For; the app port is only reachable from the LAN.
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
}
