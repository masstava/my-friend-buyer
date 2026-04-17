import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, stores } from "@workspace/db";
import {
  ListStoresResponse,
  CreateStoreBody,
  GetStoreParams,
  UpdateStoreParams,
  UpdateStoreBody,
  DeleteStoreParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/stores", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(stores).orderBy(asc(stores.name));
  res.json(ListStoresResponse.parse(rows));
});

router.post("/stores", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateStoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(stores).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/stores/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetStoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(stores).where(eq(stores.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Punto vendita non trovato" });
    return;
  }
  res.json(row);
});

router.patch("/stores/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateStoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(stores)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(stores.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Punto vendita non trovato" });
    return;
  }
  res.json(row);
});

router.delete("/stores/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteStoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(stores).where(eq(stores.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Punto vendita non trovato" });
    return;
  }
  res.sendStatus(204);
});

export default router;
