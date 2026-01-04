require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./db/setup');

// Import routes
const authRoutes = require('./routes/auth');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'note-sync-server', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 Note Sync Server is running!
  Port: ${PORT}
  Health: http://localhost:${PORT}/health
  ========================================
  `);
});