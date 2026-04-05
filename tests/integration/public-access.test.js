/**
 * Public Access & Token Health Tests
 *
 * Validates that:
 * 1. The DIRECTUS_TOKEN in .env is real and accepted by Directus
 * 2. Vendors are readable via the token (server-side proxy path)
 * 3. Categories are readable via the token
 * 4. Anonymous requests (no token) to /items/vendors are blocked (403)
 *    — confirming the proxy is the only valid read path
 * 5. The Next.js proxy routes return data (end-to-end proxy check)
 *
 * Run before deploying:
 *   cd tests && npm test -- --testPathPattern=public-access
 */

require('dotenv').config({ path: '../.env' });

const DIRECTUS_URL = process.env.DIRECTUS_INTERNAL_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const FRONTEND_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost';

// Helper
async function directusFetch(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${DIRECTUS_URL}${path}`, { headers });
  return res;
}

describe('Directus Token Health', () => {
  test('DIRECTUS_TOKEN is defined in .env', () => {
    expect(DIRECTUS_TOKEN).toBeDefined();
    expect(DIRECTUS_TOKEN.length).toBeGreaterThan(10);
  });

  test('DIRECTUS_TOKEN is accepted by Directus /users/me', async () => {
    const res = await directusFetch('/users/me', DIRECTUS_TOKEN);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.email).toBeDefined();
  });

  test('NEXT_PUBLIC_DIRECTUS_URL does not contain port 8055', () => {
    expect(FRONTEND_URL).not.toContain(':8055');
  });
});

describe('Authenticated reads (token = server-side proxy)', () => {
  test('Can read vendors with token', async () => {
    const res = await directusFetch('/items/vendors?limit=1&filter[status][_eq]=active', DIRECTUS_TOKEN);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('Can read categories with token', async () => {
    const res = await directusFetch('/items/categories?limit=1&filter[status][_eq]=active', DIRECTUS_TOKEN);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('Can read locations with token', async () => {
    const res = await directusFetch('/items/locations?limit=1', DIRECTUS_TOKEN);
    // 200 or 404 (collection may be empty) — both are fine, 403 is not
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(401);
  });
});

describe('Anonymous access is blocked (Public role has no direct read)', () => {
  test('Anonymous GET /items/vendors returns 403', async () => {
    const res = await directusFetch('/items/vendors?limit=1', null);
    // We WANT 403 here — the proxy routes handle auth, not the Public role
    expect(res.status).toBe(403);
  });

  test('Anonymous GET /items/categories returns 403', async () => {
    const res = await directusFetch('/items/categories?limit=1', null);
    expect(res.status).toBe(403);
  });
});

describe('Next.js proxy routes (end-to-end)', () => {
  // These hit the actual running frontend container
  const SITE_URL = FRONTEND_URL.includes(':8055')
    ? FRONTEND_URL.replace(':8055', '')
    : FRONTEND_URL;

  test('/api/vendors returns 200 with data array', async () => {
    const res = await fetch(`${SITE_URL}/api/vendors`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('/api/categories returns 200 with data array', async () => {
    const res = await fetch(`${SITE_URL}/api/categories`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('/api/vendors returns at least one active vendor', async () => {
    const res = await fetch(`${SITE_URL}/api/vendors`);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThan(0);
  });
});
