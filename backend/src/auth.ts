import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { db } from './db';
import { AppError } from './errors';

// Google sign-in (OAuth 2.0 authorization code flow with PKCE) and server-side sessions.
export interface User { id: string; email: string; name: string | null; picture: string | null }
const SESSION_COOKIE = 'mm_session';
const OAUTH_COOKIE = 'mm_oauth';
const SESSION_DAYS = 30;

export const appOrigin = () => (process.env.APP_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const redirectUri = () => process.env.GOOGLE_REDIRECT_URI || `${appOrigin()}/api/auth/google/callback`;
const secure = () => appOrigin().startsWith('https://');
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
const b64url = (buf: Buffer) => buf.toString('base64url');

export function cookie(name: string, value: string, options: { maxAge?: number; path?: string } = {}) {
  return [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? '/'}`, 'HttpOnly', 'SameSite=Lax',
    ...(options.maxAge !== undefined ? [`Max-Age=${options.maxAge}`] : []), ...(secure() ? ['Secure'] : [])].join('; ');
}
export function readCookie(request: Request, name: string) {
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) { try { return decodeURIComponent(rest.join('=')); } catch { return undefined; } }
  }
}
const redirect = (location: string, cookies: string[] = []) => {
  const headers = new Headers({ Location: location });
  cookies.forEach(c => headers.append('Set-Cookie', c));
  return new Response(null, { status: 302, headers });
};
// Only same-site relative paths are accepted as post-login destinations (no open redirects).
const safeNext = (next: string | null) => next && /^\/(?!\/)[\w\-/?=&.%]*$/.test(next) ? next : '/dashboard';

export function startGoogleLogin(request: Request): Response {
  if (!googleConfigured()) return redirect('/?auth_error=google_not_configured');
  const state = b64url(randomBytes(24)), verifier = b64url(randomBytes(48));
  const next = safeNext(new URL(request.url).searchParams.get('next'));
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: redirectUri(), response_type: 'code',
    scope: 'openid email profile', state, prompt: 'select_account',
    code_challenge: b64url(createHash('sha256').update(verifier).digest()), code_challenge_method: 'S256',
  });
  // State + PKCE verifier live in a short-lived HttpOnly cookie scoped to the auth routes.
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    [cookie(OAUTH_COOKIE, JSON.stringify({ state, verifier, next }), { maxAge: 600, path: '/api/auth' })]);
}

type GoogleClaims = { iss: string; aud: string; sub: string; email: string; email_verified: boolean; exp: number; name?: string; picture?: string };
export function verifyIdTokenClaims(idToken: string, clientId: string, now = Date.now() / 1000): GoogleClaims {
  // The ID token comes straight from Google's token endpoint over TLS in exchange for our client
  // secret, so (per Google's guidance) its signature need not be re-verified; the claims still are.
  const payload = idToken.split('.')[1];
  let claims: GoogleClaims;
  try { claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { throw new AppError('AUTH_FAILED', 'Google returned an unreadable sign-in token.', 401); }
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss) || claims.aud !== clientId
    || typeof claims.sub !== 'string' || !claims.email || claims.email_verified !== true || !(claims.exp > now)) {
    throw new AppError('AUTH_FAILED', 'Google sign-in could not be verified (unverified email, wrong audience or expired token).', 401);
  }
  return claims;
}

export async function finishGoogleLogin(request: Request, fetcher: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  const clear = cookie(OAUTH_COOKIE, '', { maxAge: 0, path: '/api/auth' });
  const fail = (reason: string) => redirect(`/?auth_error=${reason}`, [clear]);
  if (url.searchParams.get('error')) return fail('cancelled');
  let saved: { state: string; verifier: string; next: string };
  try { saved = JSON.parse(readCookie(request, OAUTH_COOKIE) ?? ''); } catch { return fail('expired'); }
  if (!saved?.state || saved.state !== url.searchParams.get('state') || !url.searchParams.get('code')) return fail('state_mismatch');
  if (!googleConfigured()) return fail('google_not_configured');
  let tokens: { id_token?: string };
  try {
    const response = await fetcher('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(15000),
      body: new URLSearchParams({ code: url.searchParams.get('code')!, client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri(), grant_type: 'authorization_code', code_verifier: saved.verifier }),
    });
    if (!response.ok) { await response.body?.cancel(); return fail('token_exchange'); }
    tokens = await response.json();
  } catch { return fail('token_exchange'); }
  if (!tokens.id_token) return fail('token_exchange');
  let claims: GoogleClaims;
  try { claims = verifyIdTokenClaims(tokens.id_token, process.env.GOOGLE_CLIENT_ID!); } catch { return fail('unverified'); }
  const user = await upsertUser(claims);
  const token = await createSession(user.id);
  return redirect(safeNext(saved.next), [clear, cookie(SESSION_COOKIE, token, { maxAge: SESSION_DAYS * 86400 })]);
}

export async function upsertUser(claims: { sub: string; email: string; name?: string; picture?: string }): Promise<User> {
  const result = await db().query<User>(`INSERT INTO users(id,google_sub,email,name,picture) VALUES($1,$2,$3,$4,$5)
    ON CONFLICT (google_sub) DO UPDATE SET email=EXCLUDED.email,name=EXCLUDED.name,picture=EXCLUDED.picture,last_login_at=now()
    RETURNING id,email,name,picture`, [randomUUID(), claims.sub, claims.email, claims.name ?? null, claims.picture ?? null]);
  return result.rows[0];
}
export async function createSession(userId: string) {
  const token = b64url(randomBytes(32));
  await db().query(`INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+make_interval(days => $3))`, [hash(token), userId, SESSION_DAYS]);
  await db().query('DELETE FROM sessions WHERE expires_at < now()'); // opportunistic cleanup
  return token;
}
export async function currentUser(request: Request): Promise<User | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || token.length > 100) return null;
  const result = await db().query<User>(`SELECT u.id,u.email,u.name,u.picture FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.expires_at > now()`, [hash(token)]);
  return result.rows[0] ?? null;
}
export async function requireUser(request: Request): Promise<User> {
  // No cookie means no database round trip: anonymous requests are rejected immediately.
  if (!readCookie(request, SESSION_COOKIE)) throw new AppError('UNAUTHENTICATED', 'Sign in to continue.', 401);
  const user = await currentUser(request);
  if (!user) throw new AppError('UNAUTHENTICATED', 'Your session has expired. Sign in again.', 401);
  return user;
}
export async function logout(request: Request): Promise<Response> {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) await db().query('DELETE FROM sessions WHERE token_hash=$1', [hash(token)]);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', cookie(SESSION_COOKIE, '', { maxAge: 0 }));
  return new Response(JSON.stringify({ ok: true }), { headers });
}
export async function userCount() {
  const result = await db().query<{ count: string }>('SELECT count(*) FROM users');
  return Number(result.rows[0].count);
}
