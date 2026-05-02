const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res1 = await pool.query("UPDATE users SET is_verified = true");
    console.log('Users verified:', res1.rowCount);
    const res2 = await pool.query("UPDATE mosques SET is_approved = true");
    console.log('Mosques approved:', res2.rowCount);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
