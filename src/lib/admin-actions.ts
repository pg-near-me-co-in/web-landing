"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "./db";
import {
  ADMIN_COOKIE,
  isAdminSession,
  makeSessionCookie,
  verifyAccessCode,
} from "./admin-auth";

export interface AdminActionState {
  ok: boolean;
  error?: string;
}

export async function adminLogin(
  _prev: AdminActionState | null,
  formData: FormData
): Promise<AdminActionState> {
  const code = String(formData.get("code") ?? "");
  if (!code || !verifyAccessCode(code)) {
    return { ok: false, error: "Wrong access code." };
  }
  const { name, value } = makeSessionCookie();
  (await cookies()).set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

async function guard(): Promise<void> {
  if (!(await isAdminSession())) throw new Error("Not authorised");
}

/** Publish a pending owner submission (or re-publish an archived listing). */
export async function approveListing(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(
    `update pg_listings
        set status='published', published_at=coalesce(published_at, now()), verified_at=now()
      where id=$1`,
    [id]
  );
  revalidatePath("/admin/submissions");
}

export async function rejectListing(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update pg_listings set status='rejected' where id=$1`, [id]);
  revalidatePath("/admin/submissions");
}

export async function approveReview(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update reviews set status='approved' where id=$1`, [id]);
  revalidatePath("/admin/reviews");
}

export async function rejectReview(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id") ?? "");
  await db.query(`update reviews set status='rejected' where id=$1`, [id]);
  revalidatePath("/admin/reviews");
}
