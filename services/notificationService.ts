// /services/notifyService.ts
import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();

/* 🔔 BİLDİRİM TÜRÜ AYARLA */
export async function setNotifyType(
  user_id: string,
  fixture_id: number,
  prediction_id: number,
  notify_type: "ev" | "dep" | "tum"
) {
  try {
    // Aynı prediction için eski seçim varsa sil
    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user_id)
      .eq("prediction_id", prediction_id);

    // Yeni bildirim türünü ekle
    const { data, error } = await supabase.from("notifications").insert({
      user_id,
      fixture_id,
      prediction_id,
      notify_type,
    });

    if (error) console.error("❌ setNotifyType error:", error);

    return data;
  } catch (err) {
    console.error("❌ setNotifyType exception:", err);
    return null;
  }
}

/* 🔔 BİLDİRİMİ TEMİZLE */
export async function clearNotify(user_id: string, prediction_id: number) {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user_id)
      .eq("prediction_id", prediction_id);

    if (error) console.error("❌ clearNotify error:", error);
  } catch (err) {
    console.error("❌ clearNotify exception:", err);
  }
}

/* 🔔 BİLDİRİM TÜRÜ GETİR */
export async function getNotifyType(user_id: string, prediction_id: number) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("notify_type")
      .eq("user_id", user_id)
      .eq("prediction_id", prediction_id)
      .maybeSingle();

    if (error) {
      console.error("❌ getNotifyType error:", error);
      return null;
    }

    return data?.notify_type ?? null;
  } catch (err) {
    console.error("❌ getNotifyType exception:", err);
    return null;
  }
}
