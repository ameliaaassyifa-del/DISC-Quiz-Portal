import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, quizResultsTable } from "@workspace/db";
import {
  SubmitResultBody,
  GetResultParams,
  DeleteResultParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/results", async (req, res): Promise<void> => {
  const results = await db
    .select()
    .from(quizResultsTable)
    .orderBy(sql`${quizResultsTable.created_at} desc`);
  res.json(results);
});

router.post("/results", async (req, res): Promise<void> => {
  const parsed = SubmitResultBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [result] = await db
    .insert(quizResultsTable)
    .values({
      name: parsed.data.name,
      dominance: parsed.data.dominance,
      influence: parsed.data.influence,
      steadiness: parsed.data.steadiness,
      conscientiousness: parsed.data.conscientiousness,
      disc_type: parsed.data.disc_type,
    })
    .returning();

  res.status(201).json(result);
});

router.get("/results/stats", async (_req, res): Promise<void> => {
  const total = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(quizResultsTable);

  const byType = await db
    .select({
      disc_type: quizResultsTable.disc_type,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(quizResultsTable)
    .groupBy(quizResultsTable.disc_type)
    .orderBy(sql`count(*) desc`);

  res.json({
    total: total[0]?.count ?? 0,
    by_type: byType,
  });
});

router.get("/results/:id", async (req, res): Promise<void> => {
  const params = GetResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [result] = await db
    .select()
    .from(quizResultsTable)
    .where(eq(quizResultsTable.id, params.data.id));

  if (!result) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  res.json(result);
});

router.delete("/results/:id", async (req, res): Promise<void> => {
  const params = DeleteResultParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(quizResultsTable)
    .where(eq(quizResultsTable.id, params.data.id));

  res.sendStatus(204);
});

export default router;
