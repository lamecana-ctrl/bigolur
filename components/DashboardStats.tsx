"use client";

import { useEffect, useState } from "react";

// Sayaç animasyonu
function useCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setValue(target);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
}

// Gradient progress ring
function ProgressRing({ percent }: { percent: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="url(#grad)"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute text-[13px] font-bold text-white">
        %{percent}
      </div>
    </div>
  );
}

export default function DashboardStats({
  canlı,
  yeni,
  toplam,
  basarili,
  oran,
}: {
  canlı: number;
  yeni: number;
  toplam: number;
  basarili: number;
  oran: number;
}) {
  const c1 = useCounter(canlı);
  const c2 = useCounter(yeni);
  const c3 = useCounter(toplam);
  const c4 = useCounter(basarili);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mt-4">

      {/* Kutu Style */}
      {[
        { label: "Canlı Maç", val: c1 },
        { label: "Yeni Tahmin", val: c2 },
        { label: "Toplam", val: c3 },
        { label: "Başarılı", val: c4 },
      ].map((item, i) => (
        <div
          key={i}
          className="
            min-w-[110px] 
            bg-[#0a1324] 
            rounded-xl 
            p-3 
            border border-slate-700 
            shadow-lg 
            text-center 
            text-white 
            transition-all 
            hover:shadow-emerald-500/30
          "
        >
          <div className="text-lg font-extrabold">{item.val}</div>
          <div className="text-[11px] text-gray-400">{item.label}</div>
        </div>
      ))}

      {/* ORAN ÇEMBER */}
      <div
        className="
          min-w-[110px] 
          bg-[#0a1324] 
          rounded-xl 
          p-3 
          border border-slate-700 
          shadow-lg 
          text-center 
          hover:shadow-sky-500/30
        "
      >
        <div className="flex justify-center">
          <ProgressRing percent={oran} />
        </div>
        <div className="text-[11px] text-gray-400 -mt-1">Başarı Oranı</div>
      </div>
    </div>
  );
}
