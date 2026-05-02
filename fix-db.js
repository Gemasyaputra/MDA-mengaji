const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fix() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)");
    await pool.query("ALTER TABLE mosques ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true");
    
    // Update existing to true just in case
    await pool.query("UPDATE users SET is_verified = true");
    await pool.query("UPDATE mosques SET is_approved = true");
    
    console.log("Database schema fixed and updated!");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fix();
