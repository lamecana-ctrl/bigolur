"use client";

import React from "react";
import type { Filters } from "@/types/filters";

type PanelProps = {
  filters: Filters;
  setFilters: (newFilters: Filters) => void;
  onClose: () => void;
  onApply: () => void;
};

const ButtonToggle = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    className={`px-2 py-1 rounded-lg text-xs border ${
      active
        ? "bg-emerald-600 border-emerald-600 text-black"
        : "border-slate-600 text-gray-300"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default function FiltersPanel({
  filters,
  setFilters,
  onClose,
  onApply,
}: PanelProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-900 rounded-xl p-5 border border-slate-700 max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-bold text-white mb-4">Filtreler</h2>

        {/* ÜST TAHMİNLER */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Üst Tahminleri</p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "over05", label: "0.5 Üst" },
              { key: "over15", label: "1.5 Üst" },
              { key: "over25", label: "2.5 Üst" },
              { key: "over35", label: "3.5 Üst" },
              { key: "over45", label: "4.5 Üst" },
            ].map((f) => (
              <ButtonToggle
                key={f.key}
                active={filters.predictionTypes[f.key as keyof Filters["predictionTypes"]]}
                onClick={() =>
                  setFilters({
                    ...filters,
                    predictionTypes: {
                      ...filters.predictionTypes,
                      [f.key]: !filters.predictionTypes[f.key as keyof Filters["predictionTypes"]],
                    },
                  })
                }
              >
                {f.label}
              </ButtonToggle>
            ))}
          </div>
        </div>

        {/* GOL OLASILIĞI */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Gol Olasılığı (%)</p>

          {(["home", "away", "match"] as const).map((k) => (
            <div key={k} className="mb-3">
              <label className="text-xs text-gray-400 capitalize">
                {k} Gol ≥ %{filters.probs[k]}
              </label>

              <input
                type="range"
                min={0}
                max={100}
                value={filters.probs[k]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    probs: { ...filters.probs, [k]: Number(e.target.value) },
                  })
                }
                className="w-full mt-1"
              />
            </div>
          ))}
        </div>

        {/* DAKİKA */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Dakika Aralığı</p>

          <label className="text-xs text-gray-400">
            {filters.minute.min} — {filters.minute.max}. dakika
          </label>

          <input
            type="range"
            min={0}
            max={90}
            value={filters.minute.min}
            onChange={(e) =>
              setFilters({
                ...filters,
                minute: { ...filters.minute, min: Number(e.target.value) },
              })
            }
            className="w-full mt-1"
          />

          <input
            type="range"
            min={0}
            max={90}
            value={filters.minute.max}
            onChange={(e) =>
              setFilters({
                ...filters,
                minute: { ...filters.minute, max: Number(e.target.value) },
              })
            }
            className="w-full mt-1"
          />
        </div>

        {/* SKOR DURUMU */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Skor Durumu</p>

          <div className="flex gap-2 mb-3">
            {[
              { key: "any", label: "Farketmez" },
              { key: "draw", label: "Berabere" },
              { key: "home", label: "Ev Önde" },
              { key: "away", label: "Dep Önde" },
            ].map((m) => (
              <ButtonToggle
                key={m.key}
                active={filters.score.mode === m.key}
                onClick={() =>
                  setFilters({
                    ...filters,
                    score: { ...filters.score, mode: m.key as Filters["score"]["mode"] },
                  })
                }
              >
                {m.label}
              </ButtonToggle>
            ))}
          </div>

          <label className="text-xs text-gray-400">
            En az fark: {filters.score.diff}
          </label>

          <input
            type="range"
            min={0}
            max={5}
            value={filters.score.diff}
            onChange={(e) =>
              setFilters({
                ...filters,
                score: { ...filters.score, diff: Number(e.target.value) },
              })
            }
            className="w-full mt-1"
          />
        </div>

        {/* YARI */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">Yarı</p>

          <div className="flex gap-2">
            {["all", "1Y", "2Y"].map((h) => (
              <ButtonToggle
                key={h}
                active={filters.half === h}
                onClick={() =>
                  setFilters({
                    ...filters,
                    half: h as Filters["half"],
                  })
                }
              >
                {h === "all" ? "Tümü" : h}
              </ButtonToggle>
            ))}
          </div>
        </div>

        {/* LİG */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-1">Lig</p>

          <input
            type="text"
            placeholder="Lig adı..."
            value={filters.league}
            onChange={(e) =>
              setFilters({ ...filters, league: e.target.value })
            }
            className="w-full px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 text-xs"
          />
        </div>

        {/* TAKIM */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-1">Takım</p>

          <input
            type="text"
            placeholder="Takım adı..."
            value={filters.team}
            onChange={(e) =>
              setFilters({ ...filters, team: e.target.value })
            }
            className="w-full px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 text-xs"
          />
        </div>

        {/* BUTONLAR */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-700 text-gray-200"
          >
            Kapat
          </button>

          <button
            onClick={onApply}
            className="flex-1 py-2 rounded-lg bg-emerald-600 text-black font-bold"
          >
            Uygula
          </button>
        </div>

      </div>
    </div>
  );
}
