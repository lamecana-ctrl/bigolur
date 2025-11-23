import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();

/* 📝 YORUM EKLE */
export async function addComment(
  user_id: string,
  prediction_id: number,
  fixture_id: number,
  comment_text: string,
  display_name: string
) {
  return await supabase.from("comments").insert({
    user_id,
    prediction_id,
    fixture_id,
    comment_text,
    display_name,
  });
}

/* 💬 YORUMLARI GETİR */
export async function getComments(prediction_id: number) {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("prediction_id", prediction_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ getComments error:", error);
    return [];
  }

  return data || [];
}

/* 🔢 YORUM SAYISI */
export async function getCommentCount(prediction_id: number) {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("prediction_id", prediction_id);

  if (error) {
    console.error("❌ getCommentCount error:", error);
    return 0;
  }

  return count || 0;
}
