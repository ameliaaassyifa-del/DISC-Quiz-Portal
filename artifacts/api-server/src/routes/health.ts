import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { checkSupabaseConnection } from "../lib/supabase";

const router: IRouter = Router();

router.get("/healthz", async (req, res): Promise<void> => {
  try {
    await checkSupabaseConnection();
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (error) {
    req.log.error({ error }, "Supabase connection check failed");
    res.status(503).json({ status: "degraded" });
  }
});

export default router;
