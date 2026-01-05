require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./db/db-setup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();


// Start server
app.listen(PORT, () => {
  console.log(`
  ========================================
  Cloud Server is running!
  Port: ${PORT}
  URL: http://localhost:${PORT}
  ========================================
  `);
});