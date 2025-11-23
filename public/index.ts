// supabase/functions/send-push/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

serve(async (req) => {
  try {
    const { title, body, url } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Web Push VAPID Keys
    webpush.setVapidDetails(
      "mailto:admin@yourdomain.com",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!
    );

    // Tüm kayıtlı subscription'ları çek
    const { data: subs, error } = await supabase
      .from("subscriptions")
      .select("*");

    if (error) throw error;

    // Bildirimi tüm kayıtlı tarayıcılara gönder
    for (const sub of subs) {
      const pushData = JSON.stringify({
        title,
        body,
        url,
      });

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          },
          pushData
        );
      } catch (pushErr) {
        console.log("Push send error:", pushErr);
      }
    }

    return new Response(
      JSON.stringify({ message: "Notifications sent!" }),
      { status: 200 }
    );

  } catch (err) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }
});
