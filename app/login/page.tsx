"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
      <div className="w-full max-w-md bg-[#020617] border border-[#22c55e33] shadow-[0_0_40px_rgba(34,197,94,0.25)] rounded-3xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-tight">
            <span className="text-white">bi</span>
            <span className="text-[#22c55e]">G⚽L</span>
            <span className="text-white">ur</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Tekrar hoş geldin 👋 <br />
            Hesabına giriş yap, canlı tahminleri takip et.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">E-posta</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-gray-300 bg-white text-black px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Şifre</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-gray-300 bg-white text-black px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center mt-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold py-3 rounded-2xl text-sm transition-colors"
          >
            Giriş Yap
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Hesabın yok mu?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-[#22c55e] font-medium hover:underline"
          >
            Kayıt ol
          </button>
        </p>
      </div>
    </div>
  );
}
