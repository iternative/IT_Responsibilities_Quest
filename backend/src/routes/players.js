import express from 'express';
import { pool } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get players for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM players WHERE session_id = $1 ORDER BY sort_order, created_at
    `, [req.params.sessionId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new player to a session
router.post('/session/:sessionId', async (req, res) => {
  const { name, role, color } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Player name is required' });
  }
  
  try {
    // Get max sort order
    const maxSort = await pool.query(`
      SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order 
      FROM players WHERE session_id = $1
    `, [req.params.sessionId]);
    
    const result = await pool.query(`
      INSERT INTO players (session_id, name, role, color, is_default, sort_order)
      VALUES ($1, $2, $3, $4, false, $5)
      RETURNING *
    `, [
      req.params.sessionId, 
      name, 
      role || '', 
      color || '#6366F1',
      maxSort.rows[0].next_order
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a player
router.put('/:id', async (req, res) => {
  const { name, role, color } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE players 
      SET name = COALESCE($1, name),
          role = COALESCE($2, role),
          color = COALESCE($3, color)
      WHERE id = $4 AND is_default = false
      RETURNING *
    `, [name, role, color, req.params.id]);
    
    if (result.rows.length === 0) {
      // Check if it's a default player
      const check = await pool.query('SELECT * FROM players WHERE id = $1', [req.params.id]);
      if (check.rows.length > 0 && check.rows[0].is_default) {
        return res.status(403).json({ error: 'Cannot modify default players' });
      }
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a player (only non-default)
router.delete('/:id', async (req, res) => {
  try {
    // Check if default player
    const check = await pool.query('SELECT * FROM players WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    if (check.rows[0].is_default) {
      return res.status(403).json({ error: 'Cannot delete default players' });
    }
    
    // Get the TBD player to reassign
    const tbdResult = await pool.query(`
      SELECT id FROM players WHERE session_id = $1 AND name = 'TBD'
    `, [check.rows[0].session_id]);
    
    if (tbdResult.rows.length > 0) {
      // Reassign this player's responsibilities to TBD
      await pool.query(`
        UPDATE responsibility_assignments SET player_id = $1 WHERE player_id = $2
      `, [tbdResult.rows[0].id, req.params.id]);
    }
    
    await pool.query('DELETE FROM players WHERE id = $1', [req.params.id]);
    res.json({ message: 'Player deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
