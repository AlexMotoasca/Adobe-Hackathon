import test from 'node:test';
import assert from 'node:assert/strict';
import { startGoogleLogin, finishGoogleLogin, verifyIdTokenClaims, cookie, readCookie } from '../src/auth';
import { handle } from '../src/http';

const jwt = (claims: object) => ['e30', Buffer.from(JSON.stringify(claims)).toString('base64url'), 'sig'].join('.');
const good = { iss: 'https://accounts.google.com', aud: 'client-1', sub: '123', email: 'a@example.com', email_verified: true, exp: Date.now() / 1000 + 600 };
const withEnv = async (env: Record<string, string | undefined>, fn: () => Promise<void>) => {
  const old = Object.fromEntries(Object.keys(env).map(k => [k, process.env[k]]));
  Object.entries(env).forEach(([k, v]) => v === undefined ? delete process.env[k] : process.env[k] = v);
  try { await fn(); } finally { Object.entries(old).forEach(([k, v]) => v === undefined ? delete process.env[k] : process.env[k] = v); }
};

test('Google ID token claims must match audience, issuer, expiry and a verified email', () => {
  assert.equal(verifyIdTokenClaims(jwt(good), 'client-1').sub, '123');
  for (const bad of [{ aud: 'other' }, { iss: 'evil.example' }, { email_verified: false }, { exp: 1 }]) {
    assert.throws(() => verifyIdTokenClaims(jwt({ ...good, ...bad }), 'client-1'), /could not be verified/);
  }
  assert.throws(() => verifyIdTokenClaims('not-a-jwt', 'client-1'));
});

test('sign-in starts with state + PKCE in an HttpOnly cookie and never redirects off-site afterwards', async () => {
  await withEnv({ GOOGLE_CLIENT_ID: 'client-1', GOOGLE_CLIENT_SECRET: 'secret', APP_ORIGIN: 'http://localhost:3000' }, async () => {
    const response = startGoogleLogin(new Request('http://localhost:3000/api/auth/google?next=//evil.example'));
    assert.equal(response.status, 302);
    const location = new URL(response.headers.get('location')!);
    assert.equal(location.host, 'accounts.google.com');
    assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(location.searchParams.get('redirect_uri'), 'http://localhost:3000/api/auth/google/callback');
    assert.ok(!location.toString().includes('secret'));
    const set = response.headers.get('set-cookie')!;
    assert.match(set, /mm_oauth=.*HttpOnly; SameSite=Lax/);
    const saved = JSON.parse(decodeURIComponent(set.split(';')[0].split('=').slice(1).join('=')));
    assert.equal(saved.state, location.searchParams.get('state'));
    assert.equal(saved.next, '/dashboard', 'protocol-relative next is replaced');
  });
});

test('callback rejects a state mismatch without contacting Google', async () => {
  await withEnv({ GOOGLE_CLIENT_ID: 'client-1', GOOGLE_CLIENT_SECRET: 'secret' }, async () => {
    let called = false;
    const request = new Request('http://localhost:3000/api/auth/google/callback?code=x&state=attacker', { headers: { cookie: 'mm_oauth=' + encodeURIComponent(JSON.stringify({ state: 'real', verifier: 'v', next: '/dashboard' })) } });
    const response = await finishGoogleLogin(request, (async () => { called = true; return Response.json({}); }) as typeof fetch);
    assert.equal(response.headers.get('location'), '/?auth_error=state_mismatch');
    assert.equal(called, false);
  });
});

test('unconfigured Google sign-in explains itself; cookies are parsed safely', async () => {
  await withEnv({ GOOGLE_CLIENT_ID: undefined, GOOGLE_CLIENT_SECRET: undefined }, async () => {
    assert.equal(startGoogleLogin(new Request('http://localhost/api/auth/google')).headers.get('location'), '/?auth_error=google_not_configured');
  });
  assert.equal(readCookie(new Request('http://x', { headers: { cookie: 'a=1; mm_session=abc%3D' } }), 'mm_session'), 'abc=');
  await withEnv({ APP_ORIGIN: 'https://app.example' }, async () => { assert.match(cookie('x', 'y'), /Secure/); });
  const me = await handle(new Request('http://localhost/api/analyses'), ['analyses']);
  assert.equal(me.status, 401);
});
