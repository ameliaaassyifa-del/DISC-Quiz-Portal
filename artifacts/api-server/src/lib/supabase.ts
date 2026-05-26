import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface DiscResultRow {
  id: number;
  created_at: string;
  name: string;
  dominant: string;
  scores: Record<string, number>;
}

export function rowToResult(row: DiscResultRow) {
  const scores = row.scores ?? {};
  return {
    id: row.id,
    name: row.name,
    dominance: scores["D"] ?? 0,
    influence: scores["I"] ?? 0,
    steadiness: scores["S"] ?? 0,
    conscientiousness: scores["C"] ?? 0,
    disc_type: row.dominant,
    created_at: row.created_at,
  };
}
