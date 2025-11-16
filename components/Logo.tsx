// components/Logo.tsx
"use client";

export default function Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const base = "font-extrabold tracking-tight";
  const sizeClass = size === "sm" ? "text-2xl" : "text-3xl";
  return (
    <div className={`${base} ${sizeClass} flex items-center gap-1`}>
      <span className="text-white">bi</span>
      <span className="text-[#22c55e]">G</span>
      <span className="text-[#22c55e]">⚽</span>
      <span className="text-[#22c55e]">L</span>
      <span className="text-white">ur</span>
    </div>
  );
}
