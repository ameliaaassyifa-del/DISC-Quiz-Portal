import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase Secrets: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

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

export async function checkSupabaseConnection(): Promise<void> {
  const { error } = await supabase
    .from("disc_results")
    .select("id", { head: true, count: "exact" });

  if (error) {
    throw new Error(`Supabase disc_results check failed: ${error.message}`);
  }
}
