"use client";

import { useEffect, useState } from "react";
import { getComments, addComment } from "@/services/commentService";
import { supabase } from "@/lib/supabaseClient";

export default function CommentModal({
  predictionId,
  fixtureId,
  user_id,
  user_display_name,
  home_team,
  away_team,
  home_logo,
  away_logo,
  home_goals,
  away_goals,
  elapsed,
  onClose,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const loadComments = async () => {
    const data = await getComments(predictionId);
    setComments(data);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const submitComment = async () => {
    if (!text.trim()) return;

    await addComment(
      user_id,
      predictionId,
      fixtureId,
      text,
      user_display_name
    );

    setText("");
    loadComments();
  };

  return (
    <>
      {/* 🔥 Arka plan blur + fade */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      {/* MODAL */}
      <div className="fixed inset-0 flex justify-center items-center z-50 px-3">
        <div className="bg-[#0f172a] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl p-5 relative">

          {/* X BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-400 text-xl hover:text-white"
          >
            ✖
          </button>

          {/* TAKIM + SKOR BAŞLIK */}
          <div className="flex flex-col items-center pb-4">
            <div className="flex items-center gap-4 mb-1">
              <img src={home_logo} className="w-10 h-10 rounded-full" />
              <div className="text-white text-3xl font-bold">
                {home_goals} - {away_goals}
              </div>
              <img src={away_logo} className="w-10 h-10 rounded-full" />
            </div>

            {/* Takım isimleri */}
            <div className="flex items-center gap-10 text-gray-300 text-[13px]">
              <span>{home_team}</span>
              <span>{away_team}</span>
            </div>

            {/* Dakika */}
            <div className="mt-1 text-[12px] text-gray-400">
              ⏱ {elapsed}'. dk
            </div>
          </div>

          {/* YORUM LİSTESİ */}
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scroll">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-slate-800 p-2 rounded-lg border border-slate-700"
              >
                <div className="text-sky-300 text-[11px] flex items-center gap-1">
                  👤 {c.display_name}
                </div>

                <div className="text-white text-[13px] mt-1">
                  {c.comment_text}
                </div>

                <div className="text-gray-500 text-[10px] mt-1">
                  {new Date(c.created_at).toLocaleString("tr-TR")}
                </div>
              </div>
            ))}
          </div>

          {/* YAZMA ALANI */}
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm focus:outline-none"
              placeholder="Yorum yaz..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              onClick={submitComment}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-bold"
            >
              Gönder
            </button>
          </div>
        </div>
      </div>

      {/* Scroll bar stil */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </>
  );
}
