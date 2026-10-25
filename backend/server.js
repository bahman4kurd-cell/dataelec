import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'node:path';
import { promisify } from 'node:util';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import translations from './translations.js';

dotenv.config();

const app = express();
const clientDistPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist'
);
const scrypt = promisify(scryptCallback);
const sessions = new Map();
const loginAttempts = new Map();
const sessionCookie = 'dataelec_session';

// ڕێگەپێدانی CORS و JSON
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(clientDistPath));

// ڕێکخستنی داتابەیس
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// ئەگەر DATABASE_URL ڕێکنەخرابێت، هیچ پەیوەندییەک بە لۆکاڵهۆست نەبێت
function missingDatabaseUrl(res) {
  if (process.env.DATABASE_URL) return false;
  res.status(500).json({
    error: 'DATABASE_URL is not set. Please link a PostgreSQL database to this service in the Render dashboard.',
  });
  return true;
}

async function ensureStateTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function adminBootstrapPassword() {
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error('Set ADMIN_BOOTSTRAP_PASSWORD to a unique value of at least 12 characters.');
  }
  return password;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString('hex')}`;
}

async function verifyPassword(password, storedPassword) {
  const [scheme, salt, storedHash] = String(storedPassword).split('$');
  if (scheme !== 'scrypt' || !salt || !storedHash) return password === storedPassword;
  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(await scrypt(password, salt, expected.length));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function loadState() {
  await ensureStateTable();
  const result = await pool.query('SELECT data FROM app_state WHERE id = TRUE');
  if (result.rows[0]) {
    const state = result.rows[0].data;
    const defaultAdmin = state.users?.find((user) => user.username === 'admin' && user.password === '123456');
    if (defaultAdmin) {
      defaultAdmin.password = await hashPassword(adminBootstrapPassword());
      await saveState(state);
    }
    return state;
  }

  const initialState = {
    users: [{
      id: 1,
      username: 'admin',
      password: await hashPassword(adminBootstrapPassword()),
      role: 'super_admin',
      name: 'بەڕێوەبەری گشتی',
    }],
  };
  await pool.query(
    'INSERT INTO app_state (id, data) VALUES (TRUE, $1::jsonb)',
    [JSON.stringify(initialState)]
  );
  return initialState;
}

async function saveState(data) {
  await ensureStateTable();
  await pool.query(
    `
      INSERT INTO app_state (id, data, updated_at)
      VALUES (TRUE, $1::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `,
    [JSON.stringify(data)]
  );
}

function publicUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function sessionToken(req) {
  const cookies = req.headers.cookie || '';
  const tokenCookie = cookies.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookie}=`));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice(sessionCookie.length + 1)) : null;
}

async function requireAuthentication(req, res, next) {
  const token = sessionToken(req);
  const session = token && sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const state = await loadState();
    const user = state.users?.find((entry) => entry.id === session.userId);
    if (!user) {
      sessions.delete(token);
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }
    req.authUser = user;
    req.appState = state;
    next();
  } catch (error) {
    console.error('Unable to validate session:', error);
    res.status(500).json({ error: 'Unable to validate session.' });
  }
}

function userBranchIds(user) {
  const ids = Array.isArray(user.branchIds) ? [...user.branchIds] : [];
  if (user.branchId !== null && user.branchId !== undefined) ids.push(user.branchId);
  return new Set(ids.map(Number));
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

app.post('/api/login', async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const attemptKey = `${req.ip}:${username}`;
  const attempts = loginAttempts.get(attemptKey);
  if (attempts && attempts.count >= 10 && Date.now() - attempts.startedAt < 15 * 60 * 1000) {
    return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
  }

  try {
    if (missingDatabaseUrl(res)) return;
    const state = await loadState();
    const user = state.users?.find((entry) => entry.username?.trim().toLowerCase() === username);
    if (!user) throw new Error('Invalid credentials.');

    if (!(await verifyPassword(password, user.password))) throw new Error('Invalid credentials.');
    let passwordsMigrated = false;
    for (const storedUser of state.users) {
      if (!String(storedUser.password).startsWith('scrypt$')) {
        storedUser.password = await hashPassword(storedUser.password);
        passwordsMigrated = true;
      }
    }
    if (passwordsMigrated) {
      await saveState(state);
    }

    const token = randomBytes(32).toString('hex');
    sessions.set(token, { userId: user.id, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    res.setHeader('Set-Cookie', `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    loginAttempts.delete(attemptKey);
    res.json({ user: publicUser(user) });
  } catch (error) {
    if (error.message === 'Invalid credentials.') {
      const current = loginAttempts.get(attemptKey);
      loginAttempts.set(attemptKey, current
        ? { ...current, count: current.count + 1 }
        : { count: 1, startedAt: Date.now() });
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    console.error('Unable to authenticate user:', error);
    res.status(500).json({ error: error.message || 'Unable to authenticate user.' });
  }
});

app.post('/api/logout', (req, res) => {
  const token = sessionToken(req);
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', `${sessionCookie}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  res.status(204).end();
});

app.get('/api/session', requireAuthentication, (req, res) => {
  res.json({ user: publicUser(req.authUser) });
});

app.get('/api/state', requireAuthentication, (req, res) => {
  res.json(visibleState(req.appState, req.authUser));
});

app.put('/api/state', requireAuthentication, async (req, res) => {
  if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Application state must be an object.' });
  }

  try {
    const current = req.appState;
    let nextState;
    if (req.authUser.role === 'super_admin') {
      nextState = { ...current, ...req.body };
      if (Array.isArray(req.body.users)) {
        const existingUsers = new Map((current.users || []).map((user) => [user.id, user]));
        nextState.users = await Promise.all(req.body.users.map(async (user) => {
          const existing = existingUsers.get(user.id);
          const suppliedPassword = typeof user.password === 'string' ? user.password : '';
          const password = !suppliedPassword || (existing && await verifyPassword(suppliedPassword, existing.password))
            ? existing?.password
            : await hashPassword(suppliedPassword);
          return {
            ...user,
            password,
          };
        }));
      }
    } else if (req.authUser.role === 'branch_admin') {
      const branchIds = userBranchIds(req.authUser);
      const regionIds = new Set((current.regions || [])
        .filter((region) => branchIds.has(Number(region.branchId)))
        .map((region) => Number(region.id)));
      const submittedUsers = Array.isArray(req.body.users) ? req.body.users : [];
      const ownUser = submittedUsers.find((user) => user.id === req.authUser.id);
      const users = [...(current.users || [])];
      const ownUserIndex = users.findIndex((user) => user.id === req.authUser.id);
      if (ownUser && ownUserIndex >= 0 && typeof ownUser.password === 'string' && ownUser.password) {
        if (!(await verifyPassword(ownUser.password, users[ownUserIndex].password))) {
          users[ownUserIndex] = {
            ...users[ownUserIndex],
            password: await hashPassword(ownUser.password),
          };
        }
      }
      nextState = {
        ...current,
        users,
        branchVotes: mergeScopedMap(current.branchVotes, req.body.branchVotes, branchIds),
        branchMeta: mergeScopedMap(current.branchMeta, req.body.branchMeta, branchIds),
        regionVotes: mergeScopedMap(current.regionVotes, req.body.regionVotes, regionIds),
        regionMeta: mergeScopedMap(current.regionMeta, req.body.regionMeta, regionIds),
      };
    } else {
      return res.status(403).json({ error: 'This account is read-only.' });
    }

    await saveState(nextState);
    res.status(204).end();
  } catch (error) {
    console.error('Unable to save application state:', error);
    res.status(500).json({ error: 'Unable to save application state.' });
  }
});

app.get('/api/rounds', requireAuthentication, (req, res) => {
  const rounds = visibleState(req.appState, req.authUser).rounds;
  res.json(Array.isArray(rounds) ? rounds : []);
});

async function ensureRegionVotesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS region_votes (
      region_id INTEGER PRIMARY KEY,
      votes JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// پاشەکەوتکردنی دەنگەکانی ناوچە بەبێ دەستکاری داتای app_state
app.post('/api/region-votes', requireAuthentication, async (req, res) => {
  const { regionId, votes } = req.body || {};
  if (regionId === undefined || regionId === null || !Array.isArray(votes)) {
    return res.status(400).json({ error: 'regionId and votes[] are required.' });
  }
  try {
    if (req.authUser.role === 'viewer') {
      return res.status(403).json({ error: 'This account is read-only.' });
    }
    if (req.authUser.role !== 'super_admin') {
      const region = (req.appState.regions || []).find((entry) => Number(entry.id) === Number(regionId));
      if (!region || !userBranchIds(req.authUser).has(Number(region.branchId))) {
        return res.status(403).json({ error: 'This account cannot update votes for this region.' });
      }
    }
    await ensureRegionVotesTable();
    await pool.query(
      `
        INSERT INTO region_votes (region_id, votes, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (region_id)
        DO UPDATE SET votes = EXCLUDED.votes, updated_at = NOW()
      `,
      [regionId, JSON.stringify(votes)]
    );
    res.json({ ok: true, regionId });
  } catch (error) {
    console.error('Unable to save region votes:', error);
    res.status(500).json({ error: 'Unable to save region votes.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(clientDistPath, 'index.html'), (error) => {
    if (error) next(error);
  });
});

// وەرگرتنی پۆرت
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} - server.js:30`);
});