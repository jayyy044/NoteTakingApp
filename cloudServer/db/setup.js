const pool = require('./pool');

async function initializeDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create sync events table (for your Yjs/CRDT event log)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sync_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        page_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        client_id VARCHAR(100)
      );
    `);

    // Create blob registry table (for content-addressed storage)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blobs (
        hash VARCHAR(64) PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };