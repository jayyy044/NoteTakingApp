const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Keep only the ERROR listener. It's a safety net for unexpected pool failures.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error (non-fatal):', err.message);
});

// Your initialization function with retries (excellent as-is)
async function initializeDatabase() {
  const maxRetries = 10;
  const retryDelay = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to connect to database (attempt ${attempt}/${maxRetries})...`);
      
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS config (
          id INTEGER PRIMARY KEY DEFAULT 1,
          username VARCHAR(50) NOT NULL,
          password_hash TEXT NOT NULL,
          trusted_domains JSONB DEFAULT '["localhost"]',
          CHECK (id = 1)
        );
      `);
      
      client.release();
      
      console.log('Database connection established successfully!');
      console.log('Config table created/verified!');
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = { initializeDatabase };