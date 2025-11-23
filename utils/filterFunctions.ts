import { Prediction } from "@/services/predictionService";

// =============================
// ZAMAN FİLTRESİ
// =============================
function isWithinRange(dateStr: string, filter: string): boolean {
  const now = new Date();
  const created = new Date(dateStr);

  const start = new Date();
  const end = new Date();

  switch (filter) {
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

  return created >= start && created <= end;
}

// =============================
// GOL OLASI DEĞERLERİ
// =============================
function getGoalProbs(p: Prediction) {
  if (p.prediction_half === "1Y") {
    return {
      home: p.iy_home_goal_until_ht_prob,
      away: p.iy_away_goal_until_ht_prob,
      match: p.iy_match_goal_until_ht_prob,
    };
  }

  return {
    home: p["2y_home_goal_until_ft_prob"],
    away: p["2y_away_goal_until_ft_prob"],
    match: p["2y_match_goal_until_ft_prob"],
  };
}

// =============================
// SKOR FARKI
// =============================
function getScoreDiff(p: Prediction): number {
  if (typeof p.home_goals !== "number" || typeof p.away_goals !== "number")
    return 0;
  return p.home_goals - p.away_goals;
}

// =============================
// ANA FONKSİYON
// =============================
export function applyFilters(
  list: Prediction[],
  filters: any,
  timeFilter: string,
  statusFilter: string
): Prediction[] {
  return list.filter((p) => {
    // 1) ZAMAN
    if (!isWithinRange(p.created_at, timeFilter)) return false;

    // 2) STATUS
    if (statusFilter === "yeni") {
      if (!(p.analysis_status === "Yeni Tahmin" && p.result_outcome_match === "Devam Ediyor"))
        return false;
    }

    if (statusFilter === "analiz") {
      if (!(p.analysis_status === "Analiz Ediliyor" && p.result_outcome_match === "Devam Ediyor"))
        return false;
    }

    if (statusFilter === "sonuc") {
      if (!["Başarılı", "Başarısız"].includes(p.result_outcome_match)) return false;
    }

    // 3) ÜST TAHMİNİ
    const selectedUpperFilters = Object.keys(filters.predictionTypes).filter(
      (x) => filters.predictionTypes[x] === true
    );

    if (selectedUpperFilters.length > 0) {
      const allowedLabels = selectedUpperFilters.map((key) => {
        if (key === "over05") return "0.5 Üst";
        if (key === "over15") return "1.5 Üst";
        if (key === "over25") return "2.5 Üst";
        if (key === "over35") return "3.5 Üst";
        if (key === "over45") return "4.5 Üst";
        return "";
      });

      if (!allowedLabels.includes(p.prediction_label)) return false;
    }

    // 4) Probability filtreleri
    const probs = getGoalProbs(p);

    if (filters.probs.home > 0 && probs.home * 100 < filters.probs.home) return false;
    if (filters.probs.away > 0 && probs.away * 100 < filters.probs.away) return false;
    if (filters.probs.match > 0 && probs.match * 100 < filters.probs.match) return false;

    // 5) Dakika filtre
    if (p.elapsed < filters.minute.min || p.elapsed > filters.minute.max) return false;

    // 6) Skor farkı
    const diff = getScoreDiff(p);

    if (filters.score.mode === "draw" && diff !== 0) return false;
    if (filters.score.mode === "home" && diff <= 0) return false;
    if (filters.score.mode === "away" && diff >= 0) return false;
    if (Math.abs(diff) < filters.score.diff) return false;

    // 7) Lig / takım
    if (filters.league && filters.league !== "" && p.league_name !== filters.league) {
      return false;
    }

    if (filters.team && filters.team !== "") {
      const team = filters.team.toLowerCase();
      if (
        !p.home_team.toLowerCase().includes(team) &&
        !p.away_team.toLowerCase().includes(team)
      ) {
        return false;
      }
    }

    return true;
  });
}
