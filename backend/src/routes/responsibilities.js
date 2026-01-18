import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

// Get all responsibility templates (hierarchical)
router.get('/templates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM responsibility_templates 
      WHERE is_active = true 
      ORDER BY sort_order, title
    `);
    
    // Build hierarchy
    const itemsById = {};
    const rootItems = [];
    
    result.rows.forEach(item => {
      itemsById[item.id] = { ...item, children: [] };
    });
    
    result.rows.forEach(item => {
      if (item.parent_id && itemsById[item.parent_id]) {
        itemsById[item.parent_id].children.push(itemsById[item.id]);
      } else if (!item.parent_id) {
        rootItems.push(itemsById[item.id]);
      }
    });
    
    res.json(rootItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments for a session (flat with template data)
router.get('/assignments/:sessionId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        t.title,
        t.description,
        t.why_it_matters,
        t.typical_owner,
        t.category,
        t.parent_id,
        t.sort_order as template_sort_order,
        t.industry_tags,
        p.name as player_name,
        p.color as player_color
      FROM responsibility_assignments a
      JOIN responsibility_templates t ON a.template_id = t.id
      LEFT JOIN players p ON a.player_id = p.id
      WHERE a.session_id = $1 AND t.is_active = true
      ORDER BY t.sort_order
    `, [req.params.sessionId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an assignment (pile, player, expanded state)
router.patch('/assignments/:id', async (req, res) => {
  const { pile, player_id, is_expanded, notes } = req.body;
  
  try {
    let updateFields = [];
    let values = [];
    let paramIndex = 1;
    
    if (pile !== undefined) {
      updateFields.push(`pile = $${paramIndex++}`);
      values.push(pile);
    }
    if (player_id !== undefined) {
      updateFields.push(`player_id = $${paramIndex++}`);
      values.push(player_id);
    }
    if (is_expanded !== undefined) {
      updateFields.push(`is_expanded = $${paramIndex++}`);
      values.push(is_expanded);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);
    
    const result = await pool.query(`
      UPDATE responsibility_assignments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update assignments (for cascade logic)
router.post('/assignments/bulk-update', async (req, res) => {
  const { session_id, template_ids, player_id, pile } = req.body;
  
  if (!session_id || !template_ids || template_ids.length === 0) {
    return res.status(400).json({ error: 'session_id and template_ids are required' });
  }
  
  try {
    let updateFields = [];
    let values = [session_id, template_ids];
    let paramIndex = 3;
    
    if (player_id !== undefined) {
      updateFields.push(`player_id = $${paramIndex++}`);
      values.push(player_id);
    }
    if (pile !== undefined) {
      updateFields.push(`pile = $${paramIndex++}`);
      values.push(pile);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const result = await pool.query(`
      UPDATE responsibility_assignments 
      SET ${updateFields.join(', ')}
      WHERE session_id = $1 AND template_id = ANY($2)
      RETURNING *
    `, values);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all children template IDs for a parent (for cascade assignment)
router.get('/templates/:id/descendants', async (req, res) => {
  try {
    // Recursive CTE to get all descendants
    const result = await pool.query(`
      WITH RECURSIVE descendants AS (
        SELECT id, parent_id
        FROM responsibility_templates
        WHERE id = $1
        
        UNION ALL
        
        SELECT t.id, t.parent_id
        FROM responsibility_templates t
        INNER JOIN descendants d ON t.parent_id = d.id
      )
      SELECT id FROM descendants
    `, [req.params.id]);
    
    res.json(result.rows.map(r => r.id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session statistics
router.get('/stats/:sessionId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pile,
        COUNT(*) as count
      FROM responsibility_assignments
      WHERE session_id = $1
      GROUP BY pile
    `, [req.params.sessionId]);
    
    const stats = {
      handled: 0,
      need_help: 0,
      unknown: 0,
      unassigned: 0,
      total: 0
    };
    
    result.rows.forEach(row => {
      stats[row.pile] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });
    
    stats.progress = Math.round(((stats.handled + stats.need_help + stats.unknown) / stats.total) * 100);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
