export type Filters = {
  predictionTypes: {
    over05: boolean;
    over15: boolean;
    over25: boolean;
    over35: boolean;
    over45: boolean;
  };

  probs: {
    home: number;
    away: number;
    match: number;
  };

  minute: {
    min: number;
    max: number;
  };

  score: {
    mode: "any" | "draw" | "home" | "away";
    diff: number;
  };

  half: "all" | "1Y" | "2Y";

  league: string;
  team: string;
};
