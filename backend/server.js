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
    res.status(500).json({ error: 'Unable to load application state.' });
  }
});

app.put('/api/state', async (req, res) => {
  if (!req.body || Array.isArray(req.body) || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Application state must be an object.' });
  }

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
    res.status(500).json({ error: 'Unable to save application state.' });
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