"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";

import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from "@/services/favoriteService";

import {
  setNotifyType as saveNotify,
  clearNotify,
  getNotifyType,
} from "@/services/notificationService";

import { getCommentCount } from "@/services/commentService";
import CommentModal from "./CommentModal";

interface PredictionCardProps {
  id: number;
  fixture_id: number;

  home_team?: string | null;
  away_team?: string | null;
  home_logo?: string | null;
  away_logo?: string | null;

  elapsed?: number | null;
  home_goals?: number | null;
  away_goals?: number | null;

  prediction_half?: string | null;
  prediction_label?: string | null;

  result_outcome_match?: string | null;

  created_at?: string | null;

  iy_home_goal_until_ht_prob?: number | null;
  iy_away_goal_until_ht_prob?: number | null;
  iy_match_goal_until_ht_prob?: number | null;

  ["2y_home_goal_until_ft_prob"]?: number | null;
  ["2y_away_goal_until_ft_prob"]?: number | null;
  ["2y_match_goal_until_ft_prob"]?: number | null;

  signal_count?: number | null;
}

export default function PredictionCard(props: PredictionCardProps) {
  const supabase = getSupabase();

  // NULL SAFE ALANLAR
  const predictionHalf = props.prediction_half ?? "";
  const predictionLabel = props.prediction_label ?? "";
  const elapsed = props.elapsed ?? 0;

  const homeGoals = props.home_goals ?? 0;
  const awayGoals = props.away_goals ?? 0;

  const homeTeam = props.home_team ?? "";
  const awayTeam = props.away_team ?? "";

  const homeLogo = props.home_logo ?? "";
  const awayLogo = props.away_logo ?? "";

  const outcome = props.result_outcome_match ?? "Devam Ediyor";

  const signalCount = props.signal_count ?? 0;

  const createdAt = props.created_at
    ? new Date(props.created_at).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // PROB SAFE
  const isFirstHalf = predictionHalf === "1Y";

  const ev = isFirstHalf
    ? props.iy_home_goal_until_ht_prob ?? 0
    : props["2y_home_goal_until_ft_prob"] ?? 0;

  const mac = isFirstHalf
    ? props.iy_match_goal_until_ht_prob ?? 0
    : props["2y_match_goal_until_ft_prob"] ?? 0;

  const dep = isFirstHalf
    ? props.iy_away_goal_until_ht_prob ?? 0
    : props["2y_away_goal_until_ft_prob"] ?? 0;

  // 🟥🟩 Bordo kontrolü
  const borderColor =
    outcome === "Başarılı"
      ? "border-emerald-500"
      : outcome === "Başarısız"
      ? "border-red-500"
      : "border-yellow-400";

  // -----------------------------
  // USER
  // -----------------------------
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Kullanıcı");

  const [fav, setFav] = useState(false);
  const [notifyType, setNotifyType] =
    useState<"ev" | "dep" | "tum" | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  const [commentModal, setCommentModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await supabase.auth.getUser();
      if (u.data.user) {
        const usr = u.data.user;
        setUserId(usr.id);

        const mail = usr.email ?? "";
        const dn =
          usr.user_metadata?.display_name ??
          (mail ? mail.split("@")[0] : "Kullanıcı");

        setDisplayName(dn);
      }
    };

    load();
  }, []);

  // FAVORİ + NOTIFY + YORUM SAYISI
  useEffect(() => {
    if (!userId) return;

    const loadStatus = async () => {
      setFav(!!(await isFavorite(userId, props.id)));
      setNotifyType(await getNotifyType(userId, props.id));
      setCommentCount(await getCommentCount(props.id));
    };

    loadStatus();
  }, [userId]);

  const toggleFavorite = async () => {
    if (!userId) return;

    if (fav) {
      await removeFavorite(userId, props.id);
      setFav(false);
    } else {
      await addFavorite(userId, props.id, props.fixture_id);
      setFav(true);
    }
  };

  const toggleNotify = async (type: "ev" | "dep" | "tum") => {
    if (!userId) return;

    if (notifyType === type) {
      await clearNotify(userId, props.id);
      setNotifyType(null);
    } else {
      await saveNotify(userId, props.id, props.fixture_id, type);
      setNotifyType(type);
    }
  };

  // ---------------------------------------------

  return (
    <>
      {commentModal && (
        <CommentModal
          predictionId={props.id}
          fixtureId={props.fixture_id}
          user_id={userId!}
          user_display_name={displayName}
          home_team={homeTeam}
          away_team={awayTeam}
          home_logo={homeLogo}
          away_logo={awayLogo}
          home_goals={homeGoals}
          away_goals={awayGoals}
          elapsed={elapsed}
          onClose={async () => {
            setCommentModal(false);
            setCommentCount(await getCommentCount(props.id));
          }}
        />
      )}

      <div className={`p-4 rounded-xl bg-slate-900 border ${borderColor} shadow-md mb-3`}>
        
        {/* ÜST BİLGİ */}
        <div className="flex justify-between text-[11px] text-gray-300 mb-3">
          <div className="flex items-center gap-1">
            🔮 <span className="font-bold text-sky-400">{predictionLabel}</span>
            <span className="text-gray-400">({predictionHalf})</span>
          </div>

          <div>🔔 {signalCount} Sinyal</div>
          <div>{createdAt}</div>
        </div>

        <div className="border-t border-slate-700 mb-3"></div>

        {/* TAKIM + SKOR */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col items-center w-20">
            <img src={homeLogo} className="w-10 h-10 rounded-full border border-slate-600" />
            <span className="text-[11px] text-gray-300 mt-1">{homeTeam}</span>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {homeGoals} - {awayGoals}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">⏱ {elapsed}'. dk</div>
          </div>

          <div className="flex flex-col items-center w-20">
            <img src={awayLogo} className="w-10 h-10 rounded-full border border-slate-600" />
            <span className="text-[11px] text-gray-300 mt-1">{awayTeam}</span>
          </div>
        </div>

        <div className="border-t border-slate-700 mb-3"></div>

        {/* PROB */}
        <div className="grid grid-cols-3 text-center mb-3">
          <div>
            <div className="text-[10px] text-gray-400">Ev</div>
            <div className="font-bold text-emerald-400">%{(ev * 100).toFixed(0)}</div>
          </div>

          <div>
            <div className="text-[10px] text-gray-400">Maç</div>
            <div className="font-bold text-emerald-400">%{(mac * 100).toFixed(0)}</div>
          </div>

          <div>
            <div className="text-[10px] text-gray-400">Dep</div>
            <div className="font-bold text-emerald-400">%{(dep * 100).toFixed(0)}</div>
          </div>
        </div>

        <div className="border-t border-slate-700 mb-3"></div>

        {/* ALT BUTONLAR */}
        <div className="flex justify-between items-center text-[13px]">
          {/* FAVORİ */}
          <button onClick={toggleFavorite} className={`${fav ? "text-yellow-300" : "text-gray-500"} text-xl`}>
            {fav ? "⭐" : "☆"}
          </button>

          {/* YORUM */}
          <button onClick={() => setCommentModal(true)} className="text-gray-400 hover:text-sky-400 text-lg">
            💬 <span className="text-[10px]">({commentCount})</span>
          </button>

          {/* EV */}
          <button onClick={() => toggleNotify("ev")} className={`${notifyType === "ev" ? "text-emerald-400" : "text-gray-500"} flex items-center gap-1`}>
            ⚽ <span className="text-[11px]">Ev</span>
          </button>

          {/* DEP */}
          <button onClick={() => toggleNotify("dep")} className={`${notifyType === "dep" ? "text-orange-400" : "text-gray-500"} flex items-center gap-1`}>
            ⚽ <span className="text-[11px]">Dep</span>
          </button>

          {/* TÜM */}
          <button onClick={() => toggleNotify("tum")} className={`${notifyType === "tum" ? "text-red-400" : "text-gray-500"} flex items-center gap-1`}>
            ⚽ <span className="text-[11px]">Tümü</span>
          </button>
        </div>
      </div>
    </>
  );
}
