const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    // Drop the old constraint
    await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
    // Add the new constraint
    await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'teacher', 'parent'))");
    console.log("Constraint updated successfully.");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
