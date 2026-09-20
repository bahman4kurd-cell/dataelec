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

// ڕووتی سەرەکی
app.get('/', (req, res) => {
  res.send('Server is running smoothly on Render!');
});

// وەرگرتنی پۆرت
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} - server.js:30`);
});