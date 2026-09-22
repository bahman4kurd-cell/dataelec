import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import translations from './translations.js';

dotenv.config();

const app = express();

// ڕێگەپێدانی CORS و JSON
app.use(cors());
app.use(express.json());

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

app.get('/api/state', async (_req, res) => {
  if (missingDatabaseUrl(res)) return;
  try {
    await ensureStateTable();
    const result = await pool.query('SELECT data FROM app_state WHERE id = TRUE');
    if (result.rows[0]) {
      return res.json(result.rows[0].data);
    }

    const initialState = {
      users: [
        {
          id: 1,
          username: 'admin',
          password: '123456',
          role: 'super_admin',
          name: 'بەڕێوەبەری گشتی',
        },
      ],
    };
    await pool.query(
      'INSERT INTO app_state (id, data) VALUES (TRUE, $1::jsonb)',
      [JSON.stringify(initialState)]
    );
    res.json(initialState);
  } catch (error) {
    console.error('Unable to load application state:', error);
    res.status(500).json({ error: 'Unable to load application state.', detail: String(error?.message || error) });
  }
});

app.put('/api/state', async (req, res) => {
  if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Application state must be an object.' });
  }

  if (missingDatabaseUrl(res)) return;

  try {
    await ensureStateTable();
    await pool.query(
      `
        INSERT INTO app_state (id, data, updated_at)
        VALUES (TRUE, $1::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `,
      [JSON.stringify(req.body)]
    );
    res.status(204).end();
  } catch (error) {
    console.error('Unable to save application state:', error);
    res.status(500).json({ error: 'Unable to save application state.', detail: String(error?.message || error) });
  }
});

// وەرگرتنی خولەکان لە دۆخی پاشەکەوتکراو
app.get('/api/rounds', async (_req, res) => {
  if (missingDatabaseUrl(res)) return;
  try {
    await ensureStateTable();
    const result = await pool.query('SELECT data FROM app_state WHERE id = TRUE');
    const rounds = result.rows[0]?.data?.rounds;
    res.json(Array.isArray(rounds) ? rounds : []);
  } catch (error) {
    console.error('Unable to load rounds:', error);
    res.status(500).json({ error: 'Unable to load rounds.', detail: String(error?.message || error) });
  }
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
app.post('/api/region-votes', async (req, res) => {
  const { regionId, votes } = req.body || {};
  if (regionId === undefined || regionId === null || !Array.isArray(votes)) {
    return res.status(400).json({ error: 'regionId and votes[] are required.' });
  }
  if (missingDatabaseUrl(res)) return;

  try {
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

// ڕووتی سەرەکی
app.get('/', (req, res) => {
  res.send('Server is running smoothly on Render!');
});

// وەرگرتنی پۆرت
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} - server.js:30`);
});