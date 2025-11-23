// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import Logo from "@/components/Logo";

export default function SplashPage() {
  const router = useRouter();
  const supabase = getSupabase();     
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;

      // ufak bir animasyon süresi
      setTimeout(() => {
        if (hasSession) router.replace("/home");
        else router.replace("/login");
      }, 1000);
    };

    check();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-[#020617] via-[#020817] to-black">
      <Logo />
      <p className="mt-4 text-sm text-gray-300">
        Veri konuşur, biz dinleriz.
      </p>

      <div className="mt-10 w-16 h-16 rounded-full border-4 border-[#22c55e40] border-t-[#22c55e] animate-spin" />

      <p className="mt-6 text-xs text-gray-500 uppercase tracking-[0.25em]">
        YÜKLENİYOR
      </p>
    </div>
  );
}
