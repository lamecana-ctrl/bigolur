"use client";

interface PredictionCardProps {
  id: number;
  fixture_id: number;

  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;

  elapsed: number;
  prediction_half: string;
  prediction_label: string;

  analysis_status: string;
  result_outcome_match: string;

  created_at?: string;
  home_goals?: number;
  away_goals?: number;

  signal_count?: number;

  iy_home_goal_until_ht_prob?: number;
  iy_away_goal_until_ht_prob?: number;
  iy_match_goal_until_ht_prob?: number;

  ["2y_home_goal_until_ft_prob"]?: number;
  ["2y_away_goal_until_ft_prob"]?: number;
  ["2y_match_goal_until_ft_prob"]?: number;
}

export default function PredictionCard(props: PredictionCardProps) {

  const isFirstHalf = props.prediction_half === "1Y";

  const evProb = isFirstHalf
    ? props.iy_home_goal_until_ht_prob
    : props["2y_home_goal_until_ft_prob"];

  const depProb = isFirstHalf
    ? props.iy_away_goal_until_ht_prob
    : props["2y_away_goal_until_ft_prob"];

  const macProb = isFirstHalf
    ? props.iy_match_goal_until_ht_prob
    : props["2y_match_goal_until_ft_prob"];

  const timeText = props.created_at
    ? new Date(props.created_at).toLocaleString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit"
      })
    : "";

  // === DURUM RENK ===
  const statusColors = {
    "Başarılı": "border-emerald-500/70 shadow-[0_0_12px_#00ff88aa]",
    "Başarısız": "border-red-500/70 shadow-[0_0_12px_#ff0000aa]",
    "Devam Ediyor": "border-yellow-400/60 shadow-[0_0_12px_#ffff0099]"
  };

  const borderStyle = statusColors[props.result_outcome_match] || "border-yellow-400/60";

  return (
    <div className={`w-full bg-[#0b122d]/70 backdrop-blur-xl rounded-2xl p-4 border ${borderStyle}`}>
      
      {/* === ÜST BÖLÜM === */}
      <div className="flex justify-between items-start mb-2">
        
        {/* Tahmin türü */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10">
            {isFirstHalf ? "1. Yarı" : "2. Yarı"}
          </span>
        </div>

        {/* Sağ Üst: Zaman */}
        <div className="text-right">
          <div className="text-[11px] text-white/70 font-medium">{props.elapsed}'. dk</div>
          <div className="text-[10px] text-white/40">{timeText}</div>
        </div>
      </div>

      {/* === SİNYAL SAYISI === */}
      {props.signal_count && props.signal_count > 1 && (
        <div className="text-center mb-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-semibold">
            {props.signal_count} Sinyal
          </span>
        </div>
      )}

      {/* === MAÇ SATIRI === */}
      <div className="flex items-center justify-between px-1 my-3">
        
        {/* Ev logo */}
        <img src={props.home_logo} className="w-8 h-8 rounded-full" />

        {/* Ev takım */}
        <div className="w-1/3 text-center text-[12px] text-white/80 font-medium px-1">
          {props.home_team}
        </div>

        {/* Skor */}
        <div className="flex items-center justify-center w-16">
          <span className="text-xl text-white font-bold">{props.home_goals ?? 0}</span>
          <span className="text-white/40 mx-1">-</span>
          <span className="text-xl text-white font-bold">{props.away_goals ?? 0}</span>
        </div>

        {/* Deplasman takım */}
        <div className="w-1/3 text-center text-[12px] text-white/80 font-medium px-1">
          {props.away_team}
        </div>

        {/* Deplasman logo */}
        <img src={props.away_logo} className="w-8 h-8 rounded-full" />

      </div>

      {/* === ORAN GRID === */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        
        <div>
          <div className="text-[10px] text-white/50">{isFirstHalf ? "1Y Ev" : "2Y Ev"}</div>
          <div className="font-bold text-emerald-400 text-sm">
            %{evProb ? (evProb * 100).toFixed(1) : "0"}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-white/50">{isFirstHalf ? "1Y Maç" : "2Y Maç"}</div>
          <div className="font-bold text-emerald-400 text-sm">
            %{macProb ? (macProb * 100).toFixed(1) : "0"}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-white/50">{isFirstHalf ? "1Y Dep" : "2Y Dep"}</div>
          <div className="font-bold text-emerald-400 text-sm">
            %{depProb ? (depProb * 100).toFixed(1) : "0"}
          </div>
        </div>

      </div>

      {/* === ALT KISIM === */}
      <div className="flex justify-between items-center mt-3">
        
        <div>
          <div className="text-[10px] text-white/50">Tahmin</div>
          <div className="text-sm font-semibold text-white">
            {props.prediction_label}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-white/50">Durum</div>
          
          <span
            className={`
              px-2 py-0.5 rounded-full text-xs font-semibold
              ${
                props.result_outcome_match === "Başarılı"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : props.result_outcome_match === "Başarısız"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-400/20 text-yellow-300"
              }
            `}
          >
            {props.result_outcome_match}
          </span>
        </div>
      </div>

    </div>
  );
}
