import { Pool, types } from 'pg';

// See lib/db.ts for why this is necessary: `timestamp` (no time zone) columns are
// stored as UTC here, but pg's default parser reads them back using the server
// process's local time zone, shifting every value by the local UTC offset (+7h on
// a WIB host) once serialized — the "7 jam yang lalu" bug.
types.setTypeParser(1114, (val) => (val === null ? null : new Date(val + 'Z')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: (string | number | boolean | null)[]) {
  try {
    const result = await pool.query(text, params);
    return { success: true, data: result.rows, error: null };
  } catch (error: any) {
    console.error('Database error:', error.message);
    return { success: false, data: null, error: 'Terjadi kesalahan pada server.' };
  }
}

export async function queryOne(text: string, params?: (string | number | boolean | null)[]) {
  const result = await query(text, params);
  return result.success && result.data ? result.data[0] : null;
}

export async function execute(text: string, params?: (string | number | boolean | null)[]) {
  try {
    await pool.query(text, params);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Database error:', error.message);
    return { success: false, error: 'Terjadi kesalahan pada server.' };
  }
}

export async function executeReturning(text: string, params?: (string | number | boolean | null)[]) {
  try {
    const result = await pool.query(text, params);
    return { success: true, data: result.rows[0] ?? null, error: null };
  } catch (error: any) {
    console.error('Database error:', error.message);
    return { success: false, data: null, error: 'Terjadi kesalahan pada server.' };
  }
}
