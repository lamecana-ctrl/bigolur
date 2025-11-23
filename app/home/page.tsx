"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FiltersPanel from "@/components/FiltersPanel";
import PredictionCard from "@/components/PredictionCard";

import { fetchActiveLatestPredictions } from "@/services/predictionService";
import { applyFilters } from "@/utils/filterFunctions";
import { getSupabase } from "@/lib/supabaseClient";

import type { Prediction } from "@/types/prediction";
import type { Filters } from "@/types/filters";

type TimeFilter = "today" | "yesterday" | "week" | "month";
type StatusFilter = "yeni" | "analiz" | "sonuc";

export default function HomePage() {
  const supabase = getSupabase();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("yeni");

  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [filtered, setFiltered] = useState<Prediction[]>([]);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // -----------------------------------
  // DEFAULT FILTERS (TÜM TİPLER UYUMLU)
  // -----------------------------------
  const [filters, setFilters] = useState<Filters>({
    predictionTypes: {
      over05: false,
      over15: false,
      over25: false,
      over35: false,
      over45: false,
    },
    probs: { home: 0, away: 0, match: 0 },
    minute: { min: 0, max: 90 },
    score: { mode: "any", diff: 0 },
    half: "all",
    league: "",
    team: "",
  });

  // -----------------------------------
  // AUTH
  // -----------------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.push("/login");
        return;
      }

      setEmail(data.user.email || "");
      loadData();
    });
  }, []);

  // -----------------------------------
  // FIRST FETCH
  // -----------------------------------
  const loadData = async () => {
    try {
      const rows = await fetchActiveLatestPredictions();
      setAllPredictions(rows);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // REALTIME: INSERT + DELETE
  // -----------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("predictions-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "predictions" },
        (payload) => {
          setAllPredictions((prev) => {
            const exists = prev.some((p) => p.id === payload.new.id);
            if (exists) return prev;

            return [payload.new as Prediction, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "predictions" },
        (payload) => {
          setAllPredictions((prev) =>
            prev.filter((p) => p.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // async değil → Vercel uyumlu
    };
  }, []);

  // -----------------------------------
  // POLLING (UPDATE) — 15 saniye
  // -----------------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      const rows = await fetchActiveLatestPredictions();

      setAllPredictions((prev) => {
        let changed = false;

        if (rows.length !== prev.length) changed = true;

        if (!changed) {
          for (let i = 0; i < rows.length; i++) {
            const a = prev[i];
            const b = rows[i];
            if (!a || !b) continue;

            for (const key in b) {
              if (a[key as keyof Prediction] !== b[key as keyof Prediction]) {
                changed = true;
                break;
              }
            }

            if (changed) break;
          }
        }

        if (!changed) return prev;
        return rows;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------------
  // FILTER UYGULAMA
  // -----------------------------------
  useEffect(() => {
    const updated = applyFilters(
      allPredictions,
      filters,
      timeFilter,
      statusFilter
    );
    setFiltered(updated);
  }, [allPredictions, filters, timeFilter, statusFilter]);

  // -----------------------------------
  // COUNTERS
  // -----------------------------------
  const liveCount = new Set(
    allPredictions
      .filter(
        (p) =>
          p.analysis_status === "Analiz Ediliyor" &&
          p.result_outcome_match === "Devam Ediyor"
      )
      .map((p) => p.fixture_id)
  ).size;

  const newCount = new Set(
    allPredictions
      .filter(
        (p) =>
          p.analysis_status === "Yeni Tahmin" &&
          p.result_outcome_match === "Devam Ediyor"
      )
      .map((p) => `${p.fixture_id}-${p.prediction_half}-${p.prediction_label}`)
  ).size;

  const resultPool = allPredictions.filter((p) =>
    ["Başarılı", "Başarısız"].includes(p.result_outcome_match ?? "")
  );

  const filteredResults = resultPool.filter((p) => {
    const created = new Date(p.created_at!);
    const now = new Date();

    let start = new Date();
    let end = new Date();

    if (timeFilter === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (timeFilter === "yesterday") {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (timeFilter === "week") {
      start.setDate(now.getDate() - 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return created >= start && created <= end;
  });

  const totalCount = filteredResults.length;
  const successCount = filteredResults.filter(
    (p) => p.result_outcome_match === "Başarılı"
  ).length;

  const successRate =
    totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  // -----------------------------------
  // RENDER
  // -----------------------------------
  return (
    <div className="min-h-screen flex justify-center bg-[#020617] px-3 py-4">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-3xl font-extrabold tracking-tight">
              bi<span className="text-[#22c55e]">G⚽L</span>ur
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Hoş geldin <span className="text-[#22c55e]">{email}</span> 🔥
            </p>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Çıkış
          </button>
        </div>

        {/* TIME FILTERS */}
        <div className="flex flex-wrap gap-2 mb-4 justify-end">
          {[
            { key: "today", label: "Bugün" },
            { key: "yesterday", label: "Dün" },
            { key: "week", label: "Bu Hafta" },
            { key: "month", label: "Bu Ay" },
          ].map((t) => (
            <button
              key={t.key}
              className={`px-3 py-1.5 rounded-full text-[11px] border ${
                timeFilter === t.key
                  ? "bg-emerald-500 text-black"
                  : "border-slate-600 text-slate-300"
              }`}
              onClick={() => setTimeFilter(t.key as TimeFilter)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* COUNTERS */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          <div className="p-2 rounded-xl bg-[#0f172a] border border-sky-600 text-center">
            <div className="text-[11px] text-sky-300">Canlı</div>
            <div className="text-sky-400 font-bold text-lg">{liveCount}</div>
          </div>

          <div className="p-2 rounded-xl bg-[#0f172a] border border-emerald-600 text-center">
            <div className="text-[11px] text-emerald-300">Yeni</div>
            <div className="text-emerald-400 font-bold text-lg">{newCount}</div>
          </div>

          <div className="p-2 rounded-xl bg-[#0f172a] border border-slate-600 text-center">
            <div className="text-[11px] text-slate-300">Toplam</div>
            <div className="text-slate-200 font-bold text-lg">{totalCount}</div>
          </div>

          <div className="p-2 rounded-xl bg-[#0f172a] border border-green-600 text-center">
            <div className="text-[11px] text-green-300">Başarılı</div>
            <div className="text-green-400 font-bold text-lg">{successCount}</div>
          </div>

          <div className="p-2 rounded-xl bg-[#0f172a] border border-yellow-600 text-center">
            <div className="text-[11px] text-yellow-300">%Oran</div>
            <div className="text-yellow-400 font-bold text-lg">%{successRate}</div>
          </div>
        </div>

        {/* STATUS FILTERS */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {[
              { key: "yeni", label: "Yeni Tahmin" },
              { key: "analiz", label: "Canlı Analiz" },
              { key: "sonuc", label: "Sonuçlar" },
            ].map((s) => (
              <button
                key={s.key}
                className={`px-4 py-1 rounded-full text-[12px] border ${
                  statusFilter === s.key
                    ? "bg-sky-500 text-black"
                    : "border-slate-700 text-slate-300"
                }`}
                onClick={() => setStatusFilter(s.key as StatusFilter)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterPanelOpen(true)}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-[13px]"
            >
              ⚙️
            </button>

            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-[13px]"
            >
              ⇅
            </button>
          </div>
        </div>

        {/* LISTING */}
        {!loading && statusFilter === "yeni" && (
          <div className="space-y-3">
            {allPredictions
              .filter(
                (p) =>
                  p.analysis_status === "Yeni Tahmin" &&
                  p.result_outcome_match === "Devam Ediyor"
              )
              .map((p) => (
                <PredictionCard key={p.id!} {...p} />
              ))}
          </div>
        )}

        {!loading && statusFilter === "analiz" && (
          <div className="space-y-3">
            {allPredictions
              .filter(
                (p) =>
                  p.analysis_status === "Analiz Ediliyor" &&
                  p.result_outcome_match === "Devam Ediyor"
              )
              .map((p) => (
                <PredictionCard key={p.id!} {...p} />
              ))}
          </div>
        )}

        {!loading && statusFilter === "sonuc" && (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PredictionCard key={p.id!} {...p} />
            ))}
          </div>
        )}

        {/* EMPTY STATES */}
        {loading && (
          <div className="mt-10 text-center text-xs text-slate-400">
            Yükleniyor...
          </div>
        )}

        {!loading && statusFilter === "yeni" && newCount === 0 && (
          <div className="text-center text-xs text-slate-400 mt-10">
            Yapay Zeka yeni tahmin üretiyor...
          </div>
        )}

        {!loading && statusFilter === "analiz" && liveCount === 0 && (
          <div className="text-center text-xs text-slate-400 mt-10">
            Canlı analiz bulunamadı...
          </div>
        )}

        {/* FILTER PANEL */}
        {filterPanelOpen && (
          <FiltersPanel
            filters={filters}
            setFilters={setFilters}
            onClose={() => setFilterPanelOpen(false)}
            onApply={() => setFilterPanelOpen(false)}
          />
        )}

      </div>
    </div>
  );
}
