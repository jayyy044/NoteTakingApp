const { pool } = require('../db/db-setup.js')

async function isSetupComplete() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM config');
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Error checking setup:', error);
    return false;
  }
}

module.exports = {isSetupComplete}