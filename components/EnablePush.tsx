"use client";

import { useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function EnablePush() {
  const supabase = getSupabase();

  async function registerPush() {
    // 1) Bildirim izni
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Bildirim izni vermen gerekiyor.");
      return;
    }

    // 2) Service worker kaydı
    const reg = await navigator.serviceWorker.register("/push-sw.js");

    // 3) Push aboneliği
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // 4) Kullanıcıyı al
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      alert("Kullanıcı bulunamadı!");
      return;
    }

    // 5) Token kaydet
    await supabase.from("push_tokens").insert({
      user_id: user.id,
      token: JSON.stringify(sub),
    });

    alert("Bildirim aktif edildi!");
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
