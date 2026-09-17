import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// پەیوەندی بە داتابەیسی PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // ناوی داتابەیسەکەت کە دۆزیمانەوە
    password: 'پاسۆردەکەی_داتابەیسەکەت_لێرە_بنوسە', // پاسۆردەکەی خۆت لێرە بنووسە
    port: 5432,
});

// 1. هێنان و تۆمارکردنی بەکارهێنەران (Users)
app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.post('/api/users', async (req: Request, res: Response) => {
    const { username, password, name, role, branch_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password, name, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, password, name, role, branch_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// 2. خولەکانی هەڵبژاردن (Election Rounds)
app.get('/api/rounds', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM election_rounds');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.post('/api/rounds', async (req: Request, res: Response) => {
    const { name, date, type, total_voters, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO election_rounds (name, date, type, total_voters, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, date, type, total_voters, status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// دەستپێکردنی سێرڤەر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} - server.ts:70`);
});