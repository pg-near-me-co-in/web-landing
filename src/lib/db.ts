import "server-only";
import { Pool } from "pg";

// Server-only Postgres access via the Supabase session pooler.
// All public pages read published rows only (enforced again by RLS for any
// future client-side access path).
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const db =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // keep small: parallel build workers each get their own pool, and the
    // Supabase pooler caps total clients
    max: 2,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = db;
