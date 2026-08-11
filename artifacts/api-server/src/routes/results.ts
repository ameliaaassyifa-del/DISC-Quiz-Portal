import { Router, type IRouter } from "express";
import { supabase, rowToResult, type DiscResultRow } from "../lib/supabase";
import { SubmitResultBody, GetResultParams, DeleteResultParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/results", async (req, res): Promise<void> => {
  const { data, error } = await supabase
    .from("disc_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    req.log.error({ error }, "Failed to fetch results");
    res.status(500).json({ error: error.message });
    return;
  }

  res.json((data as DiscResultRow[]).map(rowToResult));
});

router.post("/results", async (req, res): Promise<void> => {
  const parsed = SubmitResultBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, dominance, influence, steadiness, conscientiousness, disc_type } = parsed.data;

  const { data, error } = await supabase
    .from("disc_results")
    .insert({
      name,
      dominant: disc_type,
      scores: { D: dominance, I: influence, S: steadiness, C: conscientiousness },
    })
    .select()
    .single();

  if (error) {
    req.log.error({ error }, "Failed to insert result");
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(rowToResult(data as DiscResultRow));
});

router.get("/results/stats", async (_req, res): Promise<void> => {
  const { data, error } = await supabase
    .from("disc_results")
    .select("dominant");

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const rows = data as { dominant: string }[];
  const total = rows.length;
  const counts: Record<string, number> = {};

  for (const row of rows) {
    counts[row.dominant] = (counts[row.dominant] ?? 0) + 1;
  }

  const by_type = Object.entries(counts)
    .map(([disc_type, count]) => ({ disc_type, count }))
    .sort((a, b) => b.count - a.count);

  res.json({ total, by_type });
});

router.get("/results/:id", async (req, res): Promise<void> => {
  const params = GetResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data, error } = await supabase
    .from("disc_results")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  res.json(rowToResult(data as DiscResultRow));
});

router.delete("/results/:id", async (req, res): Promise<void> => {
  const params = DeleteResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data, error } = await supabase
    .from("disc_results")
    .delete()
    .select("id")
    .eq("id", params.data.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data || data.length === 0) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
