"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";

const supabase = getSupabase();

/* FAVORİ – BİLDİRİM – YORUM SERVİSLERİ */
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

/* NULL-SAFE PredictionCardProps */
export interface PredictionCardProps {
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
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Kullanıcı");

  const [fav, setFav] = useState(false);
  const [notifyType, setNotifyType] =
    useState<"ev" | "dep" | "tum" | null>(null);

  const [commentCount, setCommentCount] = useState(0);
  const [commentModal, setCommentModal] = useState(false);

  /* 🔐 USER LOAD */
  useEffect(() => {
    const load = async () => {
      const res = await supabase.auth.getUser();
      const u = res.data.user;

      if (u) {
        setUserId(u.id);
        setDisplayName(
          u.user_metadata?.display_name || u.email.split("@")[0]
        );
      }
    };
    load();
  }, []);

  /* FAVORİ + NOTIFY + COMMENT */
  useEffect(() => {
    if (!userId) return;

    const loadStatus = async () => {
      setFav(await isFavorite(userId, props.id));
      setNotifyType(await getNotifyType(userId, props.id));
      setCommentCount(await getCommentCount(props.id));
    };

    loadStatus();
  }, [userId]);

  /* FAVORİ */
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

  /* NOTIFY */
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

  /* PROBABILITY */
  const firstHalf = props.prediction_half === "1Y";

  const ev = firstHalf
    ? props.iy_home_goal_until_ht_prob ?? 0
    : props["2y_home_goal_until_ft_prob"] ?? 0;

  const mac = firstHalf
    ? props.iy_match_goal_until_ht_prob ?? 0
    : props["2y_match_goal_until_ft_prob"] ?? 0;

  const dep = firstHalf
    ? props.iy_away_goal_until_ht_prob ?? 0
    : props["2y_away_goal_until_ft_prob"] ?? 0;

  /* Renk */
  const borderColor =
    props.result_outcome_match === "Başarılı"
      ? "border-emerald-500"
      : props.result_outcome_match === "Başarısız"
      ? "border-red-500"
      : "border-yellow-500";

  return (
    <>
      {commentModal && (
        <CommentModal
          predictionId={props.id}
          fixtureId={props.fixture_id}
          user_id={userId!}
          user_display_name={displayName}
          home_team={props.home_team ?? "Ev"}
          away_team={props.away_team ?? "Dep"}
          home_logo={props.home_logo ?? ""}
          away_logo={props.away_logo ?? ""}
          home_goals={props.home_goals ?? 0}
          away_goals={props.away_goals ?? 0}
          fixture_minute={props.elapsed ?? 0}
          onClose={async () => {
            setCommentModal(false);
            setCommentCount(await getCommentCount(props.id));
          }}
        />
      )}

      <div className={`p-4 rounded-xl bg-slate-900 border ${borderColor} mb-3 shadow`}>
        
        {/* ÜST BİLGİ */}
        <div className="flex justify-between text-[11px] text-gray-300 mb-3">
          <div className="flex items-center gap-1">
            🔮{" "}
            <span className="font-bold text-sky-400">
              {props.prediction_label ?? "Tahmin"}
            </span>
            <span className="text-gray-400">
              ({props.prediction_half ?? "--"})
            </span>
          </div>

          <div>🔔 {props.signal_count ?? 0} Sinyal</div>

          <div>
            {props.created_at &&
              new Date(props.created_at).toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
          </div>
        </div>

        <div className="border-t border-slate-700 mb-3" />

        {/* TEAM + SCORE */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col items-center w-20">
            <img
              src={props.home_logo || ""}
              className="w-10 h-10 rounded-full border border-slate-700"
            />
            <span className="text-[11px] mt-1 text-gray-300">
              {props.home_team ?? "Ev"}
            </span>
          </div>

          <div className="text-center">
            <div className="text-3xl text-white font-bold">
              {props.home_goals ?? 0} - {props.away_goals ?? 0}
            </div>
            <div className="text-[11px] text-gray-400">
              ⏱ {props.elapsed ?? 0}'. dk
            </div>
          </div>

          <div className="flex flex-col items-center w-20">
            <img
              src={props.away_logo || ""}
              className="w-10 h-10 rounded-full border border-slate-700"
            />
            <span className="text-[11px] mt-1 text-gray-300">
              {props.away_team ?? "Dep"}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-700 mb-3" />

        {/* PROBS */}
        <div className="grid grid-cols-3 text-center mb-3">
          <div>
            <div className="text-[10px] text-gray-400">Ev</div>
            <div className="font-bold text-emerald-400">
              %{(ev * 100).toFixed(0)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-gray-400">Maç</div>
            <div className="font-bold text-emerald-400">
              %{(mac * 100).toFixed(0)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-gray-400">Dep</div>
            <div className="font-bold text-emerald-400">
              %{(dep * 100).toFixed(0)}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mb-3" />

        {/* ALT BUTONLAR */}
        <div className="flex justify-between items-center text-[14px]">
          {/* FAVORİ */}
          <button
            onClick={toggleFavorite}
            className={`${fav ? "text-yellow-300" : "text-gray-500"} text-xl`}
          >
            {fav ? "⭐" : "☆"}
          </button>

          {/* YORUM */}
          <button
            onClick={() => setCommentModal(true)}
            className="text-gray-400 hover:text-sky-400 text-lg"
          >
            💬 <span className="text-[10px]">({commentCount})</span>
          </button>

          {/* EV */}
          <button
            onClick={() => toggleNotify("ev")}
            className={`flex items-center gap-1 ${
              notifyType === "ev" ? "text-emerald-400" : "text-gray-500"
            }`}
          >
            ⚽ <span className="text-[11px]">Ev</span>
          </button>

          {/* DEP */}
          <button
            onClick={() => toggleNotify("dep")}
            className={`flex items-center gap-1 ${
              notifyType === "dep" ? "text-orange-400" : "text-gray-500"
            }`}
          >
            ⚽ <span className="text-[11px]">Dep</span>
          </button>

          {/* TÜM */}
          <button
            onClick={() => toggleNotify("tum")}
            className={`flex items-center gap-1 ${
              notifyType === "tum" ? "text-red-400" : "text-gray-500"
            }`}
          >
            ⚽ <span className="text-[11px]">Tümü</span>
          </button>
        </div>
      </div>
    </>
  );
}
