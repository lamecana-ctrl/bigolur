"use client";

import React from "react";

interface Props {
  progress: number;   // 0-100
  size?: number;      // default 90
  color?: string;     // default neon green
}

export default function AIProgressCircle({
  progress,
  size = 90,
  color = "#22c55e",
}: Props) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* 🔵 Neon Glow Background */}
      <div
        className="absolute rounded-full blur-xl opacity-40"
        style={{
          width: size,
          height: size,
          background: color,
        }}
      />

      {/* 🔵 Dönen AI Radar Çizgisi */}
      <div
        className="absolute rounded-full opacity-40 animate-spin-slow"
        style={{
          width: size,
          height: size,
          border: `2px solid ${color}`,
          borderRadius: "50%",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
        }}
      />

      {/* 🟢 Daire Progress Çizgisi */}
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* 🔥 Ortadaki Büyük % Değeri */}
      <div className="absolute text-center">
        <div className="text-xl font-extrabold" style={{ color }}>
          %{progress}
        </div>
        <div className="text-[10px] text-slate-400 -mt-1">Başarı Oranı</div>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 5s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
