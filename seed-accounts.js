const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const accounts = [
      { name: 'Gema Syaputra', email: 'syaputragema@gmail.com', role: 'admin' },
      { name: 'Ju Li', email: 'liju5035@gmail.com', role: 'teacher' },
      { name: 'Gema Syaputra', email: 'gemasyaputra04@gmail.com', role: 'admin' }
    ];

    for (const acc of accounts) {
      const check = await pool.query("SELECT * FROM users WHERE email = $1", [acc.email]);
      if (check.rows.length > 0) {
        console.log(`Updating role for ${acc.email} to ${acc.role}...`);
        await pool.query("UPDATE users SET role = $1 WHERE email = $2", [acc.role, acc.email]);
      } else {
        await pool.query(
          "INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, 'password123', $3, true)",
          [acc.name, acc.email, acc.role]
        );
        console.log(`Seeded new account: ${acc.email} as ${acc.role}`);
      }
    }
    console.log('Role assignment completed.');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
