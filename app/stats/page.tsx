"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";


export default function StatsPage() {
  const supabase = getSupabase();
  const [filter, setFilter] = useState("today");
  const [list, setList] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    fail: 0,
    rate: 0,
  });

  useEffect(() => {
    loadStats();
  }, [filter]);

  const loadStats = async () => {
    let start = new Date();
    let end = new Date();

    if (filter === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59);
    }

    if (filter === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59);
    }

    if (filter === "week") {
      start.setDate(start.getDate() - 7);
    }

    if (filter === "month") {
      start.setDate(1);
    }

    const { data } = await supabase
      .from("predictions")
      .select("*")
      .gte("predicted_at", start.toISOString())
      .lte("predicted_at", end.toISOString())
      .order("predicted_at", { ascending: false });

    if (!data) return;

    // Sadece sonuçlananlar
    const finished = data.filter(
      (x) =>
        x.result_outcome_match === "Başarılı" ||
        x.result_outcome_match === "Başarısız"
    );

    const total = finished.length;
    const success = finished.filter((x) => x.result_outcome_match === "Başarılı").length;
    const fail = finished.filter((x) => x.result_outcome_match === "Başarısız").length;

    setList(finished);

    setStats({
      total,
      success,
      fail,
      rate: total ? Math.round((success / total) * 100) : 0,
    });
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#020617] p-4">
      <div className="w-full max-w-md">

        {/* Title */}
        <h1 className="text-white text-3xl font-extrabold mb-6">
          📊 İstatistikler
        </h1>

        {/* Filters */}
        <div className="flex justify-between mb-6">
          {[
            { key: "today", label: "Bugün" },
            { key: "yesterday", label: "Dün" },
            { key: "week", label: "Hafta" },
            { key: "month", label: "Ay" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-bold ${
                filter === f.key
                  ? "bg-[#22c55e] text-black"
                  : "bg-[#0f172a] text-white border border-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats Card */}
        <div className="bg-[#0f172a] border border-[#22c55e]/40 p-4 rounded-2xl mb-6">
          <div className="text-gray-300 text-xs mb-1">
            {filter === "today" && "Bugün"}
            {filter === "yesterday" && "Dün"}
            {filter === "week" && "Bu Hafta"}
            {filter === "month" && "Bu Ay"}
          </div>

          <div className="text-2xl font-bold text-white">
            %{stats.rate} başarı
          </div>

          <div className="text-[11px] text-gray-400 mt-1">
            {stats.total} tahmin — {stats.success} doğru — {stats.fail} yanlış
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {list.map((x) => (
            <div
              key={x.id}
              className="bg-[#0f172a] border border-gray-700 rounded-xl p-3"
            >
              <div className="text-white text-xs font-bold">
                {x.league_name}
              </div>
              <div className="text-gray-300 text-xs">
                {x.home_team} vs {x.away_team}
              </div>

              <div className="flex justify-between mt-2 text-xs">
                <div className="text-gray-400">
                  Tahmin:{" "}
                  <span className="text-white font-bold">{x.prediction_label}</span>
                </div>

                <div
                  className={
                    x.result_outcome_match === "Başarılı"
                      ? "text-green-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {x.result_outcome_match}
                </div>
              </div>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <p className="text-center text-gray-500 text-xs mt-10">
            Veri bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}
