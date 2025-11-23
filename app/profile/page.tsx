"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";


export default function ProfilePage() {
  const supabase = getSupabase();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationAllowed, setNotificationAllowed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState("Türkçe");

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  // === USER FETCH ===
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser(data.user);
        setEmail(data.user.email);

        // display_name metadata
        setDisplayName(data.user.user_metadata?.display_name || "");
      }
    };

    fetchUser();
  }, []);

  // === USER UPDATE (email + display_name) ===
  const updateProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      email,
      data: { display_name: displayName }
    });

    if (error) {
      alert("Güncelleme hatası: " + error.message);
      return;
    }

    // Güncel kullanıcıyı tekrar çek
    const { data: refreshed } = await supabase.auth.getUser();
    if (refreshed?.user) {
      setUser(refreshed.user);
      setDisplayName(refreshed.user.user_metadata?.display_name);
    }

    alert("Profil güncellendi!");
  };

  // === Bildirim İzni Kontrol ===
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationAllowed(Notification.permission === "granted");
    }
  }, []);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationAllowed(permission === "granted");
  };

  // === Koyu Tema ===
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // === Logout ===
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Profil</h1>

      {/* ==== PROFİL ÜST BLOK ==== */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {(displayName || email)?.charAt(0)?.toUpperCase()}
        </div>

        <div className="flex-1">
          <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
            {displayName || "Kullanıcı"}
          </p>

          <p className="text-gray-500 dark:text-gray-400 text-sm">{email}</p>
        </div>
      </div>

      {/* ==== PROFİL DÜZENLEME ==== */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">Bilgileri Güncelle</h2>

        <div className="flex flex-col gap-3">
          {/* Display Name */}
          <div>
            <label className="text-sm dark:text-gray-300">Görünen Ad</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 mt-1 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm dark:text-gray-300">E-Posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={updateProfile}
            className="w-full py-2 rounded-xl bg-blue-600 text-white"
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* ==== ALT MENÜ ==== */}
      <div className="space-y-4">
        <Section>
          <Item label="Bildirimler" type="toggle" value={notificationAllowed} onChange={requestNotificationPermission} />
          <Item label="Sesli Bildirimler" type="toggle" value={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
          <Item label="Bildirim İzni" type="button" buttonText="İzin Ver" onClick={requestNotificationPermission} />
        </Section>

        <Section>
          <Item label="Dil" type="select" options={["Türkçe", "English", "Español"]} value={language} onChange={(e) => setLanguage(e.target.value)} />
          <Item label="Promosyon Kodu" type="button" buttonText="Kodu Gir" onClick={() => alert("Promosyon açılacak")} />
        </Section>

        <Section>
          <Item label="SSS" type="link" onClick={() => alert("SSS açılacak")} />
          <Item label="Bize Ulaşın" type="link" onClick={() => alert("İletişim açılacak")} />
        </Section>

        <Section>
          <Item label="Koyu Tema" type="toggle" value={darkMode} onChange={toggleDarkMode} />
          <Item label="Gizlilik Politikası" type="link" onClick={() => alert("Gizlilik açılacak")} />
          <Item label="Kullanım Şartları" type="link" onClick={() => alert("Şartlar açılacak")} />
        </Section>

        <Section>
          <Item label="Çıkış Yap" type="danger" onClick={handleLogout} />
        </Section>
      </div>
    </div>
  );
}

/* ==== SUB COMPONENTS ==== */

function Section({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 space-y-3">
      {children}
    </div>
  );
}

function Item({ label, type, value, onChange, onClick, buttonText, options }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-800 dark:text-gray-200">{label}</span>

      {type === "toggle" && (
        <input type="checkbox" checked={value} onChange={onChange} className="toggle toggle-success" />
      )}

      {type === "button" && (
        <button onClick={onClick} className="px-3 py-1 rounded-xl bg-blue-600 text-white text-sm">
          {buttonText}
        </button>
      )}

      {type === "link" && (
        <button onClick={onClick} className="text-blue-600 dark:text-blue-400 font-medium">
          Aç
        </button>
      )}

      {type === "select" && (
        <select value={value} onChange={onChange} className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg text-sm">
          {options.map((op) => (
            <option key={op}>{op}</option>
          ))}
        </select>
      )}

      {type === "danger" && (
        <button onClick={onClick} className="text-red-600 font-semibold">
          Çıkış Yap
        </button>
      )}
    </div>
  );
}
