import { neon } from '@neondatabase/serverless';

const cookieName = 'dataelec_session';
const passwordIterations = 120_000;
const sessionLifetimeSeconds = 8 * 60 * 60;
const loginWindowMilliseconds = 15 * 60 * 1000;
const loginLimit = 10;

function database(env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return neon(env.DATABASE_URL);
}

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeBase64Url(value) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: passwordIterations },
    key,
    256
  );
  return `pbkdf2$${passwordIterations}$${encodeBase64Url(salt)}$${encodeBase64Url(new Uint8Array(bits))}`;
}

async function verifyPassword(password, storedPassword) {
  const [scheme, iterationsText, saltText, hashText] = String(storedPassword).split('$');
  if (scheme !== 'pbkdf2' || !iterationsText || !saltText || !hashText) {
    return password === storedPassword;
  }

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 1_000_000) return false;
  const salt = decodeBase64Url(saltText);
  const expected = decodeBase64Url(hashText);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    expected.length * 8
  );
  const actual = new Uint8Array(bits);
  return expected.length === actual.length
    && actual.every((byte, index) => byte === expected[index]);
}

async function saveState(sql, state) {
  await sql`
    INSERT INTO app_state (id, data, updated_at)
    VALUES (TRUE, ${JSON.stringify(state)}::jsonb, NOW())
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
}

function bootstrapPassword(env) {
  const password = env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error('Set ADMIN_BOOTSTRAP_PASSWORD to a unique value of at least 12 characters.');
  }
  return password;
}

async function loadState(sql, env) {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  const rows = await sql`SELECT data FROM app_state WHERE id = TRUE`;
  if (rows[0]) {
    const state = rows[0].data;
    const defaultAdmin = state.users?.find(
      (user) => user.username === 'admin' && user.password === '123456'
    );
    if (defaultAdmin) {
      defaultAdmin.password = await hashPassword(bootstrapPassword(env));
      await saveState(sql, state);
    }
    return state;
  }

  const state = {
    users: [{
      id: 1,
      username: 'admin',
      password: await hashPassword(bootstrapPassword(env)),
      role: 'super_admin',
      name: 'بەڕێوەبەری گشتی',
    }],
  };
  await saveState(sql, state);
  return state;
}

function publicUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function cookieValue(request) {
  const cookie = request.headers.get('Cookie') || '';
  const entry = cookie.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  return entry ? decodeURIComponent(entry.slice(cookieName.length + 1)) : null;
}

function sessionSecret(env) {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
    throw new Error('Set SESSION_SECRET to a random value of at least 32 characters.');
  }
  return env.SESSION_SECRET;
}

async function signSession(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const body = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return `${body}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifySession(request, env) {
  const token = cookieValue(request);
  if (!token) return null;
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra) return null;
  const secret = sessionSecret(env);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    decodeBase64Url(signature),
    new TextEncoder().encode(body)
  );
  if (!valid) return null;

  const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(body)));
  if (!payload.userId || payload.expiresAt <= Date.now()) return null;
  return payload;
}

function sessionCookie(token) {
  return `${cookieName}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeSeconds}`;
}

async function authenticatedUser(request, sql, env) {
  const session = await verifySession(request, env);
  if (!session) return null;
  const state = await loadState(sql, env);
  const user = state.users?.find((entry) => entry.id === session.userId);
  return user ? { state, user } : null;
}

function userBranchIds(user) {
  const ids = Array.isArray(user.branchIds) ? [...user.branchIds] : [];
  if (user.branchId !== null && user.branchId !== undefined) ids.push(user.branchId);
  return new Set(ids.map(Number));
}

function visibleState(state, user) {
  if (user.role === 'super_admin') {
    return { ...state, users: (state.users || []).map(publicUser) };
  }

  const branchIds = userBranchIds(user);
  const branches = (state.branches || []).filter((branch) => branchIds.has(Number(branch.id)));
  const regionIds = new Set((state.regions || [])
    .filter((region) => branchIds.has(Number(region.branchId)))
    .map((region) => Number(region.id)));
  const roundIds = new Set(branches.map((branch) => Number(branch.roundId)));
  const filterMap = (map = {}, allowedIds) => Object.fromEntries(
    Object.entries(map).filter(([id]) => allowedIds.has(Number(id)))
  );

  return {
    ...state,
    users: [publicUser(user)],
    rounds: (state.rounds || []).filter((round) => roundIds.has(Number(round.id))),
    branches,
    regions: (state.regions || []).filter((region) => regionIds.has(Number(region.id))),
    branchVotes: filterMap(state.branchVotes, branchIds),
    branchMeta: filterMap(state.branchMeta, branchIds),
    regionVotes: filterMap(state.regionVotes, regionIds),
    regionMeta: filterMap(state.regionMeta, regionIds),
  };
}

function mergeScopedMap(current = {}, incoming = {}, allowedIds) {
  const merged = { ...current };
  for (const id of allowedIds) {
    const key = String(id);
    if (Object.hasOwn(incoming, key)) merged[key] = incoming[key];
    else delete merged[key];
  }
  return merged;
}

async function parseBody(request) {
  const text = await request.text();
  if (text.length > 5 * 1024 * 1024) throw new Error('Request body is too large.');
  return text ? JSON.parse(text) : {};
}

async function updateState(state, incoming, user, sql) {
  if (user.role === 'super_admin') {
    const nextState = { ...state, ...incoming };
    if (Array.isArray(incoming.users)) {
      const existingUsers = new Map((state.users || []).map((entry) => [entry.id, entry]));
      const normalizedNames = incoming.users.map((entry) => entry.username?.trim().toLowerCase());
      if (normalizedNames.some((name, index) => !name || normalizedNames.indexOf(name) !== index)) {
        throw new Error('Usernames must be present and unique.');
      }
      nextState.users = await Promise.all(incoming.users.map(async (entry) => {
        const existing = existingUsers.get(entry.id);
        const suppliedPassword = typeof entry.password === 'string' ? entry.password : '';
        let password = existing?.password;
        if (suppliedPassword && !(existing && await verifyPassword(suppliedPassword, existing.password))) {
          password = await hashPassword(suppliedPassword);
        }
        if (!password) throw new Error('A password is required for each new account.');
        return { ...entry, password };
      }));
    }
    return nextState;
  }

  if (user.role !== 'branch_admin') throw new Error('This account is read-only.');
  const branchIds = userBranchIds(user);
  const regionIds = new Set((state.regions || [])
    .filter((region) => branchIds.has(Number(region.branchId)))
    .map((region) => Number(region.id)));
  const submittedUser = incoming.users?.find((entry) => entry.id === user.id);
  const users = [...(state.users || [])];
  const userIndex = users.findIndex((entry) => entry.id === user.id);
  if (submittedUser && userIndex >= 0 && typeof submittedUser.password === 'string' && submittedUser.password) {
    if (!(await verifyPassword(submittedUser.password, users[userIndex].password))) {
      users[userIndex] = { ...users[userIndex], password: await hashPassword(submittedUser.password) };
    }
  }
  return {
    ...state,
    users,
    branchVotes: mergeScopedMap(state.branchVotes, incoming.branchVotes, branchIds),
    branchMeta: mergeScopedMap(state.branchMeta, incoming.branchMeta, branchIds),
    regionVotes: mergeScopedMap(state.regionVotes, incoming.regionVotes, regionIds),
    regionMeta: mergeScopedMap(state.regionMeta, incoming.regionMeta, regionIds),
  };
}

async function login(request, env, sql) {
  const body = await parseBody(request);
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const attemptKey = encodeBase64Url(new Uint8Array(await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${ip}:${username}`)
  )));

  await sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      attempt_key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      window_started_at BIGINT NOT NULL
    )
  `;
  const now = Date.now();
  const previous = await sql`SELECT attempts, window_started_at FROM login_attempts WHERE attempt_key = ${attemptKey}`;
  if (previous[0]
    && Number(previous[0].attempts) >= loginLimit
    && now - Number(previous[0].window_started_at) < loginWindowMilliseconds) {
    return json({ error: 'Too many login attempts. Try again in 15 minutes.' }, 429);
  }

  const state = await loadState(sql, env);
  const user = state.users?.find((entry) => entry.username?.trim().toLowerCase() === username);
  if (!user || !(await verifyPassword(password, user.password))) {
    const windowStarted = previous[0]
      && now - Number(previous[0].window_started_at) < loginWindowMilliseconds
      ? Number(previous[0].window_started_at)
      : now;
    const attempts = previous[0] && windowStarted !== now
      ? Number(previous[0].attempts) + 1
      : 1;
    await sql`
      INSERT INTO login_attempts (attempt_key, attempts, window_started_at)
      VALUES (${attemptKey}, ${attempts}, ${windowStarted})
      ON CONFLICT (attempt_key) DO UPDATE
      SET attempts = EXCLUDED.attempts, window_started_at = EXCLUDED.window_started_at
    `;
    return json({ error: 'Invalid username or password.' }, 401);
  }

  let migrated = false;
  for (const account of state.users || []) {
    if (!String(account.password).startsWith('pbkdf2$')) {
      account.password = await hashPassword(account.password);
      migrated = true;
    }
  }
  if (migrated) await saveState(sql, state);
  await sql`DELETE FROM login_attempts WHERE attempt_key = ${attemptKey}`;

  const token = await signSession({
    userId: user.id,
    expiresAt: Date.now() + sessionLifetimeSeconds * 1000,
  }, sessionSecret(env));
  return json({ user: publicUser(user) }, 200, { 'Set-Cookie': sessionCookie(token) });
}

async function saveRegionVotes(request, context, sql) {
  const body = await parseBody(request);
  const regionId = Number(body.regionId);
  if (!Number.isInteger(regionId) || !Array.isArray(body.votes)) {
    return json({ error: 'regionId and votes[] are required.' }, 400);
  }
  const { state, user } = context;
  if (user.role === 'viewer') return json({ error: 'This account is read-only.' }, 403);
  if (user.role !== 'super_admin') {
    const region = (state.regions || []).find((entry) => Number(entry.id) === regionId);
    if (!region || !userBranchIds(user).has(Number(region.branchId))) {
      return json({ error: 'This account cannot update votes for this region.' }, 403);
    }
  }

  await sql`
    CREATE TABLE IF NOT EXISTS region_votes (
      region_id INTEGER PRIMARY KEY,
      votes JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO region_votes (region_id, votes, updated_at)
    VALUES (${regionId}, ${JSON.stringify(body.votes)}::jsonb, NOW())
    ON CONFLICT (region_id)
    DO UPDATE SET votes = EXCLUDED.votes, updated_at = NOW()
  `;
  return json({ ok: true, regionId });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const route = url.pathname;
  if (route === '/api/health' && request.method === 'GET') return json({ ok: true });

  try {
    const sql = database(env);
    if (route === '/api/login' && request.method === 'POST') return await login(request, env, sql);
    if (route === '/api/logout' && request.method === 'POST') {
      return new Response(null, {
        status: 204,
        headers: { 'Set-Cookie': `${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` },
      });
    }

    const context = await authenticatedUser(request, sql, env);
    if (!context) return json({ error: 'Authentication required.' }, 401);
    if (route === '/api/session' && request.method === 'GET') {
      return json({ user: publicUser(context.user) });
    }
    if (route === '/api/state' && request.method === 'GET') {
      return json(visibleState(context.state, context.user));
    }
    if (route === '/api/state' && request.method === 'PUT') {
      const incoming = await parseBody(request);
      if (!incoming || Array.isArray(incoming) || typeof incoming !== 'object') {
        return json({ error: 'Application state must be an object.' }, 400);
      }
      const nextState = await updateState(context.state, incoming, context.user, sql);
      await saveState(sql, nextState);
      return new Response(null, { status: 204 });
    }
    if (route === '/api/rounds' && request.method === 'GET') {
      const rounds = visibleState(context.state, context.user).rounds;
      return json(Array.isArray(rounds) ? rounds : []);
    }
    if (route === '/api/region-votes' && request.method === 'POST') {
      return await saveRegionVotes(request, context, sql);
    }
    return json({ error: 'Not found.' }, 404);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'Invalid JSON request.' }, 400);
    if (error.message === 'This account is read-only.') return json({ error: error.message }, 403);
    console.error('API request failed:', error);
    return json({ error: 'Unable to process the request.' }, 500);
  }
}

export async function onRequest(context) {
  if (!new URL(context.request.url).pathname.startsWith('/api/')) {
    return new Response('Not found.', { status: 404 });
  }
  return handleApi(context.request, context.env);
}
