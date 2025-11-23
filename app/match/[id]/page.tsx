"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
const supabase = getSupabase();




interface PredictionRow {
  id: number;
  created_at: string;
  elapsed: number;
  home_goals: number;
  away_goals: number;

  prediction_half: string;
  prediction_label: string;
  result_outcome_match: string;

  iy_home_goal_until_ht_prob: number;
  iy_away_goal_until_ht_prob: number;
  iy_match_goal_until_ht_prob: number;

  ["2y_home_goal_until_ft_prob"]: number;
  ["2y_away_goal_until_ft_prob"]: number;
  ["2y_match_goal_until_ft_prob"]: number;

  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
}

export default function PredictionTimelinePage() {
  const params = useParams();
  const fixtureId = Number(params.id);

  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("fixture_id", fixtureId)
        .order("elapsed", { ascending: false });

      if (!error && data) {
        setRows(data as PredictionRow[]);
      }
      setLoading(false);
    };

    load();
  }, [fixtureId]);

  if (loading) return <div className="p-4 text-white">Yükleniyor...</div>;

  return (
    <div className="p-4 text-white space-y-4">
      <h1 className="text-xl font-bold mb-4">📊 Maç Timeline</h1>

      {rows.map((row) => {
        const isFirstHalf = row.prediction_half === "1Y";

        const ev = isFirstHalf
          ? row.iy_home_goal_until_ht_prob
          : row["2y_home_goal_until_ft_prob"];

        const mac = isFirstHalf
          ? row.iy_match_goal_until_ht_prob
          : row["2y_match_goal_until_ft_prob"];

        const dep = isFirstHalf
          ? row.iy_away_goal_until_ht_prob
          : row["2y_away_goal_until_ft_prob"];

        return (
          <div
            key={row.id}
            className={`p-4 rounded-xl bg-slate-900 border shadow-lg transition-all ${
              row.result_outcome_match === "Başarılı"
                ? "border-emerald-400"
                : row.result_outcome_match === "Başarısız"
                ? "border-red-500"
                : "border-sky-500"
            }`}
          >
            {/* ÜST - Dakika + Tarih */}
            <div className="flex justify-between mb-3">
              <div className="text-sm font-semibold text-white">
                ⏱ {row.elapsed}'. dk
              </div>
              <div className="text-[10px] text-gray-400">
                {new Date(row.created_at).toLocaleString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            </div>

            {/* TAKIMLAR + SKOR */}
            <div className="flex items-center justify-between mb-3">

              {/* EV TAKIM */}
              <div className="flex flex-col items-center">
                <img
                  src={row.home_logo}
                  alt={row.home_team}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <span className="text-[10px] text-white/60 mt-1">
                  {row.home_team}
                </span>
              </div>

              {/* SKOR */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {row.home_goals} - {row.away_goals}
                </div>
              </div>

              {/* DEP TAKIM */}
              <div className="flex flex-col items-center">
                <img
                  src={row.away_logo}
                  alt={row.away_team}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <span className="text-[10px] text-white/60 mt-1">
                  {row.away_team}
                </span>
              </div>
            </div>

            {/* OLASILIKLAR */}
            <div className="grid grid-cols-3 text-center mb-4">
              <div>
                <div className="text-[10px] text-gray-400">Ev</div>
                <div className="text-emerald-400 font-bold">
                  %{(ev * 100).toFixed(0)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-gray-400">Maç</div>
                <div className="text-emerald-400 font-bold">
                  %{(mac * 100).toFixed(0)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-gray-400">Dep</div>
                <div className="text-emerald-400 font-bold">
                  %{(dep * 100).toFixed(0)}
                </div>
              </div>
            </div>

            {/* TAHMİN */}
            <div className="text-sm text-white mb-2">
              🔮 Tahmin:{" "}
              <span className="font-bold text-sky-400">
                {row.prediction_label}
              </span>{" "}
              <span className="text-gray-300">({row.prediction_half})</span>
            </div>

            {/* DURUM */}
            <div className="text-sm font-bold">
              {row.result_outcome_match === "Başarılı" ? (
                <span className="text-emerald-400">🟢 Başarılı</span>
              ) : row.result_outcome_match === "Başarısız" ? (
                <span className="text-red-400">🔴 Başarısız</span>
              ) : (
                <span className="text-yellow-300">🟡 Analiz Ediliyor</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
