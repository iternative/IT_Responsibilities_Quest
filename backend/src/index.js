import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection } from './db/index.js';
import clientsRouter from './routes/clients.js';
import sessionsRouter from './routes/sessions.js';
import playersRouter from './routes/players.js';
import responsibilitiesRouter from './routes/responsibilities.js';
import janeRouter from './routes/jane.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Routes
app.use('/api/clients', clientsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/players', playersRouter);
app.use('/api/responsibilities', responsibilitiesRouter);
app.use('/api/jane', janeRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🎮 Responsibility Quest API running on port ${PORT}`);
  });
};

startServer();
