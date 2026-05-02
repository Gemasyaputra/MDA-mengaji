const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check'").then(res => {
  console.log(res.rows[0]);
  pool.end();
});
