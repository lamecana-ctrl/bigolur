"use client";

import React, { useEffect, useState } from "react";

interface Props {
  size?: number;
  stroke?: number;
  progress: number; // 0 - 100
  color?: string;
}

export default function ProgressRing({
  size = 60,
  stroke = 6,
  progress,
  color = "#22c55e",
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = ((100 - progress) / 100) * circumference;
    setOffset(progressOffset);
  }, [progress, circumference]);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          stroke="#1e293b"
          fill="transparent"
          strokeWidth={stroke}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />

        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>

      <span className="absolute text-[13px] font-bold" style={{ color }}>
        %{progress}
      </span>
    </div>
  );
}
