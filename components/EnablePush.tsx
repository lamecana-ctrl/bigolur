"use client";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();

export default function EnablePush() {
  async function registerPush() {
    // 1) İzin iste
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Bildirim izni vermen gerekiyor.");
      return;
    }

    // 2) Service Worker
    const reg = await navigator.serviceWorker.register("/push-sw.js");

    // 3) Push aboneliği
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // 4) Kullanıcı
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Oturum bulunamadı");
      return;
    }

    // 5) Token kaydet  (TS bypass)
    await (supabase as any).from("push_tokens").insert({
      user_id: user.id,
      token: JSON.stringify(sub),
    });

    alert("Bildirim aktif!");
  }

  return (
    <button
      onClick={registerPush}
      className="mt-4 px-4 py-2 bg-emerald-500 text-black rounded-lg"
    >
      🔔 Bildirimleri Aç
    </button>
  );
}
