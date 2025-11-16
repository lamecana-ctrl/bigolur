"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      setTimeout(() => {
        if (data.session) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      }, 2000); // 2 sn splash
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="animate-pulse text-4xl font-bold">
        bi<span className="text-green-500">G⚽L</span>ur
      </div>
      <p className="mt-4 text-gray-400">Yükleniyor...</p>
    </div>
  );
}
