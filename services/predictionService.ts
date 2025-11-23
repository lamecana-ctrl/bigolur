import { getSupabase } from "@/lib/supabaseClient";
import type { Prediction } from "@/types/prediction"; // ⭐ EKLEDİK

const supabase = getSupabase();

/* 🔮 AKTİF TAHMİNLER (latest_predictions_live VIEW) */
export async function fetchActiveLatestPredictions() {
  try {
    const { data, error } = await supabase
      .from("latest_predictions_live")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Prediction fetch error:", error);
      return [] as Prediction[];        // ⭐ Tip güvenli boş liste
    }

    return (data || []) as Prediction[]; // ⭐ EN ÖNEMLİ SATIR
  } catch (err) {
    console.error("❌ Prediction fetch exception:", err);
    return [] as Prediction[];          // ⭐ Tip güvenli boş liste
  }
}
