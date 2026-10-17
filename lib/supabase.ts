import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl.trim() &&
  (supabaseAnonKey.trim() || supabaseServiceKey.trim()) &&
  supabaseUrl.startsWith("http")
);

// Client-side and server-side Supabase client instance (null-safe fallback)
// On server environments, prefers SUPABASE_SERVICE_ROLE_KEY if available
const activeKey =
  typeof window === "undefined" && supabaseServiceKey.trim()
    ? supabaseServiceKey.trim()
    : supabaseAnonKey.trim();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, activeKey)
  : null;

