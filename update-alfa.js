require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    await pool.query(`ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;`);
    await pool.query(`ALTER TABLE attendance ADD CONSTRAINT attendance_status_check CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALFA', 'ALPA'));`);
    await pool.query(`UPDATE attendance SET status = 'ALFA' WHERE status = 'ALPA';`);
    console.log('Success');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
