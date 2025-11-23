import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const supabase = getSupabase();

  const { endpoint, keys } = await req.json();

  // USER
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // INSERT FORMAT MUST BE ARRAY
  const { error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: user.data.user.id,
        endpoint,
        p256dh: keys?.p256dh,
        auth: keys?.auth,
      },
    ]);

  if (error) {
    console.log("SUBSCRIPTION INSERT ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
