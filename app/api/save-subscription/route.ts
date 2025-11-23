import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";


export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getSupabase();

  const { endpoint, keys } = body;

  const user = await supabase.auth.getUser();
  if (!user.data?.user) {
    return NextResponse.json({ error: "No auth" }, { status: 401 });
  }

  await supabase.from("subscriptions").insert({
    user_id: user.data.user.id,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  });

  return NextResponse.json({ ok: true });
}
