import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, productSkus } from "@workspace/db";
import {
  ListSkusResponse,
  CreateSkuBody,
  GetSkuParams,
  UpdateSkuParams,
  UpdateSkuBody,
  DeleteSkuParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/skus", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(productSkus).orderBy(asc(productSkus.code));
  res.json(ListSkusResponse.parse(rows));
});

router.post("/skus", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSkuBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(productSkus).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/skus/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetSkuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(productSkus).where(eq(productSkus.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Articolo non trovato" });
    return;
  }
  res.json(row);
});

router.patch("/skus/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSkuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSkuBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(productSkus)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(productSkus.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Articolo non trovato" });
    return;
  }
  res.json(row);
});

router.delete("/skus/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteSkuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(productSkus).where(eq(productSkus.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Articolo non trovato" });
    return;
  }
  res.sendStatus(204);
});

export default router;
