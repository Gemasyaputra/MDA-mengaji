import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, types } from 'pg';

// Postgres columns declared as `timestamp` (no time zone) are stored here as UTC
// wall-clock values (Neon's default session time zone), but `pg`'s default parser
// for that type (OID 1114) builds the JS Date using the *local* time zone of this
// Node process instead of UTC. On a WIB (UTC+7) host that silently shifts every
// `created_at`-style value ~7h into the past once it round-trips through
// `new Date(...)`/`toISOString()` — exactly the "7 jam yang lalu" bug. Force it to
// parse as UTC, which matches how these columns are actually populated
// (`CURRENT_TIMESTAMP` on a UTC session).
types.setTypeParser(1114, (val) => (val === null ? null : new Date(val + 'Z')));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
