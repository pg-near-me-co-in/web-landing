import "server-only";
import { db } from "./db";

/**
 * Writes to `admin_audit_log` (schema has existed since 0001_init.sql but
 * was never written to by any admin action until the Phase 7b CRUD work).
 * `actor` stays null — there is no real per-account Supabase Auth admin
 * login yet, only the shared `ADMIN_ACCESS_CODE` cookie gate, so there is
 * no specific admin identity to attribute the action to. Resolve once real
 * admin auth ships.
 */
export async function logAdminAction(params: {
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  await db.query(
    `insert into admin_audit_log (actor, action, entity_type, entity_id, before, after)
     values (null, $1, $2, $3, $4, $5)`,
    [
      params.action,
      params.entityType,
      params.entityId ?? null,
      params.before !== undefined ? JSON.stringify(params.before) : null,
      params.after !== undefined ? JSON.stringify(params.after) : null,
    ]
  );
}
