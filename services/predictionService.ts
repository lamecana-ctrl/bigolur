import { getSupabase } from "@/lib/supabaseClient";

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
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("❌ Prediction fetch exception:", err);
    return [];
  }
}
