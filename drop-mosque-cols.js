const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log("Dropping mosque_id columns and mosques table...");
    await pool.query("ALTER TABLE users DROP COLUMN IF EXISTS mosque_id CASCADE");
    await pool.query("ALTER TABLE study_groups DROP COLUMN IF EXISTS mosque_id CASCADE");
    await pool.query("ALTER TABLE students DROP COLUMN IF EXISTS mosque_id CASCADE");
    await pool.query("ALTER TABLE activity_posts DROP COLUMN IF EXISTS mosque_id CASCADE");
    await pool.query("DROP TABLE IF EXISTS mosques CASCADE");
    console.log("Successfully removed multi-tenant architecture from database!");
  } catch(e) {
    console.error("Error:", e);
  } finally {
    pool.end();
  }
}
run();
