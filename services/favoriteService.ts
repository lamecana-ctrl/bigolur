// /services/favoriteService.ts
import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();

/* ⭐ FAVORİ EKLE */
export async function addFavorite(
  user_id: string,
  fixture_id: number,
  prediction_id: number
) {
  return await supabase.from("favorites").insert({
    user_id,
    fixture_id,
    prediction_id,
  });
}

/* ⭐ FAVORİ SİL */
export async function removeFavorite(user_id: string, prediction_id: number) {
  return await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user_id)
    .eq("prediction_id", prediction_id);
}

/* ⭐ FAVORİ Mİ? */
export async function isFavorite(user_id: string, prediction_id: number) {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user_id)
    .eq("prediction_id", prediction_id)
    .maybeSingle();

  if (error) {
    console.error("❌ isFavorite error:", error);
    return false;
  }

  return !!data;
}
