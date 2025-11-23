// supabase/functions/send-push/index.ts

import webpush from "https://esm.sh/web-push@3.6.7";

console.log("🔔 Push Notification Function Working!");

Deno.serve(async (req) => {
  try {
    const { subscription, title, body } = await req.json();

    if (!subscription) {
      return new Response("Missing subscription", { status: 400 });
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: title || "biG⚽Lur Bildirim",
        body: body || "Yeni gol haberi!",
      }),
      {
        vapidDetails: {
          subject: "mailto:info@bigolur.com",
          publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!,
          privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
        },
      }
    );

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("Hata:", e);
    return new Response("Error", { status: 500 });
  }
});
