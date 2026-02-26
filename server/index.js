import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// Insert plant image, return the new record
app.post('/api/images', async (req, res) => {
  try {
    const { image_data, captured_at } = req.body;
    if (!image_data) {
      return res.status(400).json({ error: 'image_data is required' });
    }
    const result = await pool.query(
      `INSERT INTO plant_images (image_data, captured_at) VALUES ($1, COALESCE($2::timestamptz, now())) RETURNING *`,
      [image_data, captured_at || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Insert image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Insert plant analysis
app.post('/api/analysis', async (req, res) => {
  try {
    const {
      image_id,
      health_status,
      health_score,
      green_percentage,
      yellow_percentage,
      brown_percentage,
      harvest_ready,
      recommendations,
      analyzed_at,
    } = req.body;

    if (!image_id || !health_status || health_score === undefined) {
      return res.status(400).json({ error: 'image_id, health_status, and health_score are required' });
    }

    const result = await pool.query(
      `INSERT INTO plant_analysis (
        image_id, health_status, health_score,
        green_percentage, yellow_percentage, brown_percentage,
        harvest_ready, recommendations, analyzed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, now())) RETURNING *`,
      [
        image_id,
        health_status,
        health_score,
        green_percentage ?? 0,
        yellow_percentage ?? 0,
        brown_percentage ?? 0,
        harvest_ready ?? false,
        recommendations ?? null,
        analyzed_at || null,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Insert analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch analyses with joined plant_images
app.get('/api/analyses', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const result = await pool.query(
      `SELECT pa.*, pi.id as img_id, pi.image_data, pi.captured_at, pi.created_at as img_created_at
       FROM plant_analysis pa
       JOIN plant_images pi ON pa.image_id = pi.id
       ORDER BY pa.analyzed_at DESC
       LIMIT $1`,
      [limit]
    );

    const analyses = result.rows.map((row) => ({
      id: row.id,
      image_id: row.image_id,
      health_status: row.health_status,
      health_score: row.health_score,
      green_percentage: parseFloat(row.green_percentage),
      yellow_percentage: parseFloat(row.yellow_percentage),
      brown_percentage: parseFloat(row.brown_percentage),
      harvest_ready: row.harvest_ready,
      recommendations: row.recommendations,
      analyzed_at: row.analyzed_at,
      created_at: row.created_at,
      plant_images: {
        id: row.img_id,
        image_data: row.image_data,
        captured_at: row.captured_at,
        created_at: row.img_created_at,
      },
    }));

    res.json(analyses);
  } catch (err) {
    console.error('Fetch analyses error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  if (!process.env.DATABASE_URL) {
    console.warn('Warning: DATABASE_URL not set. Create server/.env with your PostgreSQL connection string.');
  }
});
