import express from 'express';
import { pool } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();

// Generate a random access token
const generateAccessToken = () => crypto.randomBytes(32).toString('hex');

// Medal logic based on completion stats
const determineMedal = (stats) => {
  const { unknownCount, totalItems, completionTime, singleOwnerPercent } = stats;
  
  if (singleOwnerPercent > 90) return "Medal of the One-Person IT Department";
  if (completionTime < 300) return "Medal of Suspiciously Fast Decisions"; // < 5 min
  if (completionTime > 3600) return "Medal of Thorough Contemplation"; // > 60 min
  if (unknownCount === 0) return "Medal of Absolute Certainty";
  if (unknownCount < 5) return "Medal of Partial Clarity";
  if (unknownCount < 15) return "Medal of Strategic Ambiguity";
  return "Medal of Brave Confusion";
};

// Get session by access token (public endpoint)
router.get('/token/:token', async (req, res) => {
  try {
    const sessionResult = await pool.query(`
      SELECT s.*, c.name as client_name, c.logo_url, c.primary_color, c.secondary_color, c.config as client_config
      FROM game_sessions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.access_token = $1
    `, [req.params.token]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get players
    const playersResult = await pool.query(`
      SELECT * FROM players WHERE session_id = $1 ORDER BY sort_order, created_at
    `, [session.id]);
    
    // Get assignments with templates
    const assignmentsResult = await pool.query(`
      SELECT a.*, t.title, t.description, t.why_it_matters, t.typical_owner, t.category, t.parent_id, t.sort_order as template_sort_order
      FROM responsibility_assignments a
      JOIN responsibility_templates t ON a.template_id = t.id
      WHERE a.session_id = $1
      ORDER BY t.sort_order
    `, [session.id]);
    
    res.json({
      ...session,
      players: playersResult.rows,
      assignments: assignmentsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new game session for a client
router.post('/create/:clientId', async (req, res) => {
  const { clientId } = req.params;
  
  try {
    // Verify client exists
    const clientCheck = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const accessToken = generateAccessToken();
    const sessionId = uuidv4();
    
    // Create session
    const sessionResult = await pool.query(`
      INSERT INTO game_sessions (id, client_id, access_token, status)
      VALUES ($1, $2, $3, 'draft')
      RETURNING *
    `, [sessionId, clientId, accessToken]);
    
    // Create default players
    const defaultPlayers = [
      { name: 'The Boss', role: 'Primary Decision Maker', color: '#FFD700', is_default: true, sort_order: 0 },
      { name: 'ITernative', role: 'IT Partner', color: '#FF6B35', is_default: true, sort_order: 1 },
      { name: 'TBD', role: 'To Be Determined', color: '#9CA3AF', is_default: true, sort_order: 2 },
      { name: 'Shared', role: 'Shared Responsibility', color: '#8B5CF6', is_default: true, sort_order: 3 },
    ];
    
    for (const player of defaultPlayers) {
      await pool.query(`
        INSERT INTO players (session_id, name, role, color, is_default, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [sessionId, player.name, player.role, player.color, player.is_default, player.sort_order]);
    }
    
    // Get the boss player ID for initial assignments
    const bossResult = await pool.query(`
      SELECT id FROM players WHERE session_id = $1 AND name = 'The Boss'
    `, [sessionId]);
    const bossId = bossResult.rows[0].id;
    
    // Create assignments for all responsibility templates
    const templatesResult = await pool.query(`
      SELECT id FROM responsibility_templates WHERE is_active = true
    `);
    
    for (const template of templatesResult.rows) {
      await pool.query(`
        INSERT INTO responsibility_assignments (session_id, template_id, player_id, pile)
        VALUES ($1, $2, $3, 'unassigned')
      `, [sessionId, template.id, bossId]);
    }
    
    res.status(201).json({
      session: sessionResult.rows[0],
      accessToken,
      gameUrl: `/play/${accessToken}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update session (path selection, company profile, status)
router.patch('/:id', async (req, res) => {
  const { path_chosen, company_profile, status } = req.body;
  
  try {
    let updateFields = [];
    let values = [];
    let paramIndex = 1;
    
    if (path_chosen) {
      updateFields.push(`path_chosen = $${paramIndex++}`);
      values.push(path_chosen);
    }
    if (company_profile) {
      updateFields.push(`company_profile = $${paramIndex++}`);
      values.push(company_profile);
    }
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'in_progress') {
        updateFields.push(`started_at = CURRENT_TIMESTAMP`);
      }
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);
    
    const result = await pool.query(`
      UPDATE game_sessions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete the game
router.post('/:id/complete', async (req, res) => {
  try {
    // Get session stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE pile = 'unknown') as unknown_count,
        COUNT(*) as total_items,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) as completion_time
      FROM responsibility_assignments a
      JOIN game_sessions s ON a.session_id = s.id
      WHERE s.id = $1
      GROUP BY s.started_at
    `, [req.params.id]);
    
    if (statsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const stats = statsResult.rows[0];
    
    // Check for single owner dominance
    const ownershipResult = await pool.query(`
      SELECT player_id, COUNT(*) as count
      FROM responsibility_assignments
      WHERE session_id = $1
      GROUP BY player_id
      ORDER BY count DESC
      LIMIT 1
    `, [req.params.id]);
    
    const topOwnerPercent = (ownershipResult.rows[0]?.count / stats.total_items) * 100 || 0;
    
    const medalType = determineMedal({
      unknownCount: parseInt(stats.unknown_count),
      totalItems: parseInt(stats.total_items),
      completionTime: parseFloat(stats.completion_time),
      singleOwnerPercent: topOwnerPercent
    });
    
    // Update session as completed
    const result = await pool.query(`
      UPDATE game_sessions 
      SET status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          medal_type = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [medalType, req.params.id]);
    
    res.json({
      session: result.rows[0],
      stats: {
        unknownCount: parseInt(stats.unknown_count),
        totalItems: parseInt(stats.total_items),
        completionTime: parseFloat(stats.completion_time),
        medalType
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export session as markdown
router.get('/:id/export', async (req, res) => {
  try {
    // Get session with client info
    const sessionResult = await pool.query(`
      SELECT s.*, c.name as client_name
      FROM game_sessions s
      JOIN clients c ON s.client_id = c.id
      WHERE s.id = $1
    `, [req.params.id]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get players
    const playersResult = await pool.query(`
      SELECT * FROM players WHERE session_id = $1 ORDER BY sort_order
    `, [session.id]);
    
    // Get all assignments with hierarchy
    const assignmentsResult = await pool.query(`
      SELECT a.*, t.title, t.description, t.parent_id, t.category, t.sort_order as template_sort_order,
             p.name as player_name
      FROM responsibility_assignments a
      JOIN responsibility_templates t ON a.template_id = t.id
      LEFT JOIN players p ON a.player_id = p.id
      WHERE a.session_id = $1
      ORDER BY t.sort_order
    `, [session.id]);
    
    // Build markdown
    let markdown = `# Responsibility Matrix: ${session.client_name}\n\n`;
    markdown += `## Parties\n\n`;
    playersResult.rows.forEach(player => {
      markdown += `- ${player.name}${player.role ? ` (${player.role})` : ''}\n`;
    });
    markdown += `\n## Responsibilities\n\n`;
    
    // Build hierarchy
    const itemsById = {};
    const rootItems = [];
    
    assignmentsResult.rows.forEach(item => {
      itemsById[item.template_id] = { ...item, children: [] };
    });
    
    assignmentsResult.rows.forEach(item => {
      if (item.parent_id && itemsById[item.parent_id]) {
        itemsById[item.parent_id].children.push(itemsById[item.template_id]);
      } else if (!item.parent_id) {
        rootItems.push(itemsById[item.template_id]);
      }
    });
    
    // Recursive function to build markdown
    const buildMarkdownTree = (items, depth = 0) => {
      let result = '';
      const indent = '  '.repeat(depth);
      
      items.forEach(item => {
        const pileEmoji = item.pile === 'handled' ? '✅' : item.pile === 'need_help' ? '🆘' : item.pile === 'unknown' ? '❓' : '📋';
        result += `${indent}- ${pileEmoji} **${item.title}** - *Assigned to:* ${item.player_name || 'Unassigned'}\n`;
        
        if (item.children && item.children.length > 0) {
          result += buildMarkdownTree(item.children, depth + 1);
        }
      });
      
      return result;
    };
    
    markdown += buildMarkdownTree(rootItems);
    markdown += `\n---\n\n`;
    markdown += `*Generated on ${new Date().toLocaleString()}*\n`;
    markdown += `*Medal Earned: ${session.medal_type || 'Quest Incomplete'}*\n`;
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="responsibility-matrix-${session.client_name.toLowerCase().replace(/\s+/g, '-')}.md"`);
    res.send(markdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
