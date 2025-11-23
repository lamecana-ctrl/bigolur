"use client";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

// Supabase client instance (singleton)
let supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (supabase) return supabase;

  supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "bigolur-auth",
      },
    }
  );

  return supabase;
}
