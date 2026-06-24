import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// True only when BOTH env vars are present. Drives fallback mode everywhere.
export const isSupabaseConfigured = Boolean(url && anonKey);

// When not configured we still export a client typed as SupabaseClient but
// guard every call site with isSupabaseConfigured so it is never invoked.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as unknown as SupabaseClient);

export const STORAGE_BUCKET = "product-images";
