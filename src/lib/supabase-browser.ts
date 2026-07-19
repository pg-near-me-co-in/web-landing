"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client (publishable key — safe to expose, RLS applies).
// Used for Storage uploads from the owner-submission form.
let client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  return client;
}

export const LISTING_IMAGES_BUCKET = "listing-images";
