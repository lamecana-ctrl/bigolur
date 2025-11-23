"use client";

import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  // Eğer daha önce oluşturulduysa aynısını döndür
  if (supabase) return supabase;

  // İlk kez oluşturuyoruz
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,         // Token tarayıcıda saklansın
        autoRefreshToken: true,       // Token kendini yenilesin
        storageKey: "bigolur-auth",   // Özel key → refresh loop fix
      },
    }
  );

  return supabase;
}
