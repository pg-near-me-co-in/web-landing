import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Interim admin gate: a shared access code (ADMIN_ACCESS_CODE env) exchanged
// for a signed httpOnly cookie. Replace with Supabase Auth + admin_users
// role checks once auth keys/accounts are provisioned.
const COOKIE_NAME = "pgnm_admin";

function secret(): string {
  const s = process.env.ADMIN_ACCESS_CODE;
  if (!s) throw new Error("ADMIN_ACCESS_CODE is not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function makeSessionCookie(): { name: string; value: string } {
  const payload = "admin";
  return { name: COOKIE_NAME, value: `${payload}.${sign(payload)}` };
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    return (
      sig.length === expected.length &&
      timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

export function verifyAccessCode(code: string): boolean {
  const s = secret();
  const a = Buffer.from(code);
  const b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const ADMIN_COOKIE = COOKIE_NAME;
