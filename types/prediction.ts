// types/prediction.ts

import type { Database } from "@/lib/database.types";

export type Prediction =
  Database["public"]["Tables"]["predictions"]["Row"];
