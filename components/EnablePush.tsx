"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EnablePush() {

  async function registerPush() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Bildirim izni vermen gerekiyor.");
      return;
    }

    // Service worker kaydı
    const reg = await navigator.serviceWorker.register("/push-sw.js");

    // Push aboneliği oluştur
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("push_tokens").insert({
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
