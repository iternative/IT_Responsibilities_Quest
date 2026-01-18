import express from 'express';
import { pool } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new client
router.post('/', async (req, res) => {
  const { name, logo_url, primary_color, secondary_color, config } = req.body;
  
  try {
    const result = await pool.query(`
      INSERT INTO clients (name, logo_url, primary_color, secondary_color, config)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, logo_url, primary_color || '#FF6B35', secondary_color || '#1A1A2E', config || {}]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  const { name, logo_url, primary_color, secondary_color, config } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE clients 
      SET name = COALESCE($1, name),
          logo_url = COALESCE($2, logo_url),
          primary_color = COALESCE($3, primary_color),
          secondary_color = COALESCE($4, secondary_color),
          config = COALESCE($5, config),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, logo_url, primary_color, secondary_color, config, req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted', client: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
