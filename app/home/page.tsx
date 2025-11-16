"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PredictionCard from "@/components/PredictionCard";

type TimeFilter = "today" | "yesterday" | "week" | "month";
type StatusFilter = "yeni" | "analiz" | "sonuc";

type Stats = {
  total: number;
  success: number;
  fail: number;
  rate: number;
};

export default function HomePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("yeni");

  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    success: 0,
    fail: 0,
    rate: 0,
  });

  const [loading, setLoading] = useState(false);

  // USER CHECK
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login");
        return;
      }
      setEmail(data.user.email || "");
    };
    checkUser();
  }, [router]);

  // DATE FILTER
  const filterByDate = (rows: any[]) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    start.setMilliseconds(0);
    end.setMilliseconds(0);

    switch (timeFilter) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start.setFullYear(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return rows.filter((item) => {
      const created = new Date(item.created_at);
      return created >= start && created <= end;
    });
  };

  // LOAD PREDICTIONS
  const loadPredictions = async () => {
    setLoading(true);

    const { data: allRows, error } = await supabase
      .from("predictions")
      .select("*")
      .neq("result_outcome_match", "Kapandı")
      .order("created_at", { ascending: false });

    if (!allRows || error) {
      setPredictions([]);
      setStats({ total: 0, success: 0, fail: 0, rate: 0 });
      setLoading(false);
      return;
    }

    const statsFiltered = filterByDate(allRows);
    const groupedStats: Record<string, any> = {};

    statsFiltered.forEach((item) => {
      const key = `${item.fixture_id}-${item.prediction_half}-${item.prediction_label}`;
      if (!groupedStats[key]) groupedStats[key] = item;
      else {
        const prev = new Date(groupedStats[key].created_at);
        const curr = new Date(item.created_at);
        if (curr > prev) groupedStats[key] = item;
      }
    });

    const statsList = Object.values(groupedStats);
    const sonucRows = statsList.filter((x: any) =>
      ["Başarılı", "Başarısız"].includes(x.result_outcome_match)
    );

    const total = sonucRows.length;
    const success = sonucRows.filter((x: any) => x.result_outcome_match === "Başarılı").length;
    const fail = sonucRows.filter((x: any) => x.result_outcome_match === "Başarısız").length;
    const rate = total ? Math.round((success / total) * 100) : 0;

    setStats({ total, success, fail, rate });

    let listSource: any[] = [];

    if (statusFilter === "yeni") {
      listSource = allRows.filter(
        (i) =>
          i.analysis_status === "Yeni Tahmin" &&
          i.result_outcome_match === "Devam Ediyor"
      );
    }

    if (statusFilter === "analiz") {
      listSource = allRows.filter(
        (i) =>
          i.analysis_status === "Analiz Ediliyor" &&
          i.result_outcome_match === "Devam Ediyor"
      );
    }

    if (statusFilter === "sonuc") {
      const byDate = filterByDate(allRows);
      listSource = byDate.filter((i) =>
        ["Başarılı", "Başarısız"].includes(i.result_outcome_match)
      );
    }

    const grouped: Record<string, any> = {};
    listSource.forEach((item) => {
      const key = `${item.fixture_id}-${item.prediction_half}-${item.prediction_label}`;
      if (!grouped[key]) grouped[key] = { ...item, signal_count: 1 };
      else {
        grouped[key].signal_count++;
        const prev = new Date(grouped[key].created_at);
        const curr = new Date(item.created_at);
        if (curr > prev) {
          grouped[key] = { ...item, signal_count: grouped[key].signal_count };
        }
      }
    });

    setPredictions(Object.values(grouped));
    setLoading(false);
  };

  useEffect(() => {
    loadPredictions();
  }, [timeFilter, statusFilter]);

  const timeLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "today":
        return "Bugün";
      case "yesterday":
        return "Dün";
      case "week":
        return "Bu Hafta";
      case "month":
        return "Bu Ay";
    }
  };

  const statusButtonClass = (mode: StatusFilter) =>
    `px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
      statusFilter === mode
        ? mode === "yeni"
          ? "bg-emerald-500 text-black border-emerald-500"
          : mode === "analiz"
          ? "bg-yellow-400 text-black border-yellow-400"
          : "bg-sky-500 text-black border-sky-500"
        : "border-slate-600 text-slate-300 hover:bg-slate-800"
    }`;

  const timeButtonClass = (mode: TimeFilter) =>
    `px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
      timeFilter === mode
        ? "bg-emerald-500 text-black border-emerald-500"
        : "border-slate-600 text-slate-300 hover:bg-slate-800"
    }`;

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

        {/* TARİH FİLTRELERİ */}
        <div className="flex flex-wrap justify-end gap-2 mb-3">
          <button className={timeButtonClass("today")} onClick={() => setTimeFilter("today")}>
            Bugün
          </button>
          <button className={timeButtonClass("yesterday")} onClick={() => setTimeFilter("yesterday")}>
            Dün
          </button>
          <button className={timeButtonClass("week")} onClick={() => setTimeFilter("week")}>
            Bu Hafta
          </button>
          <button className={timeButtonClass("month")} onClick={() => setTimeFilter("month")}>
            Bu Ay
          </button>
        </div>

        {/* ÜST İSTATİSTİKLER */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-2">
            <div className="text-[10px] text-slate-400">Tahmin</div>
            <div className="mt-1 text-lg font-bold text-white">{stats.total}</div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-emerald-500/60 p-2">
            <div className="text-[10px] text-slate-400">Başarılı</div>
            <div className="mt-1 text-lg font-bold text-emerald-400">{stats.success}</div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-red-500/70 p-2">
            <div className="text-[10px] text-slate-400">Başarısız</div>
            <div className="mt-1 text-lg font-bold text-red-400">{stats.fail}</div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-sky-500/70 p-2">
            <div className="text-[10px] text-slate-400">Oran</div>
            <div className="mt-1 text-lg font-bold text-sky-400">%{stats.rate}</div>
          </div>
        </div>

        {/* SEKMELER */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button className={statusButtonClass("yeni")} onClick={() => setStatusFilter("yeni")}>
            Yeni Tahminler
          </button>
          <button className={statusButtonClass("analiz")} onClick={() => setStatusFilter("analiz")}>
            Analiz Ediliyor
          </button>
          <button className={statusButtonClass("sonuc")} onClick={() => setStatusFilter("sonuc")}>
            Sonuçlanan
          </button>
        </div>

        {/* BAŞLIK */}
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-200">
            {timeLabel(timeFilter)} –{" "}
            {statusFilter === "yeni"
              ? "Yeni Tahminler"
              : statusFilter === "analiz"
              ? "Analiz Edilen Tahminler"
              : "Sonuçlanan Tahminler"}
          </h2>

          <p className="text-[11px] text-gray-500">
            Model tarafından oluşturulan tahmin listesi.
          </p>
        </div>

        {/* LİSTE */}
        {loading && (
          <div className="mt-6 text-center text-xs text-slate-400">
            Yükleniyor...
          </div>
        )}

        {!loading && predictions.length === 0 && (
          <div className="mt-6 text-center text-xs text-slate-400">
            Gösterilecek tahmin yok.
          </div>
        )}

        <div className="mt-2 space-y-3">
          {predictions.map((p: any) => (
            <PredictionCard
              key={p.id}
              {...p}
              signal_count={p.signal_count}
              created_at={p.created_at}
              home_goals={p.home_goals}
              away_goals={p.away_goals}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
