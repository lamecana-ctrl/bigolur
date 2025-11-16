"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
        .order("elapsed", { ascending: false }); // yeni dakika en üstte

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
            className="p-3 rounded-xl bg-[#0f1837]/80 border border-white/10"
          >
            {/* ÜST SATIR */}
            <div className="flex justify-between mb-1">
              <div className="text-sm font-semibold">
                ⏱ {row.elapsed}'. dk
              </div>
              <div className="text-xs text-white/50">
                {new Date(row.created_at).toLocaleString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
            </div>

            {/* SKOR */}
            <div className="text-white text-lg font-bold mb-1">
              ⚽ Skor: {row.home_goals} - {row.away_goals}
            </div>

            {/* ORANLAR */}
            <div className="grid grid-cols-3 text-center mb-2">
              <div>
                <div className="text-[10px] text-white/50">
                  {isFirstHalf ? "1Y Ev" : "2Y Ev"}
                </div>
                <div className="text-emerald-400 font-bold">
                  %{(ev * 100).toFixed(1)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-white/50">
                  {isFirstHalf ? "1Y Maç" : "2Y Maç"}
                </div>
                <div className="text-emerald-400 font-bold">
                  %{(mac * 100).toFixed(1)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-white/50">
                  {isFirstHalf ? "1Y Dep" : "2Y Dep"}
                </div>
                <div className="text-emerald-400 font-bold">
                  %{(dep * 100).toFixed(1)}
                </div>
              </div>
            </div>

            {/* TAHMİN */}
            <div className="text-sm mb-1">
              🔮 Tahmin: <b>{row.prediction_label}</b> ({row.prediction_half})
            </div>

            {/* DURUM */}
            <div className="text-sm">
              Durum:{" "}
              {row.result_outcome_match === "Başarılı" ? (
                <span className="text-emerald-400 font-bold">🟢 Başarılı</span>
              ) : row.result_outcome_match === "Başarısız" ? (
                <span className="text-red-400 font-bold">🔴 Başarısız</span>
              ) : (
                <span className="text-yellow-300 font-bold">
                  🟡 Analiz Ediliyor
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
