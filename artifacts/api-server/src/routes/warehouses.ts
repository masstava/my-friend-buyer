import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, warehouses } from "@workspace/db";
import {
  ListWarehousesResponse,
  CreateWarehouseBody,
  GetWarehouseParams,
  UpdateWarehouseParams,
  UpdateWarehouseBody,
  DeleteWarehouseParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/warehouses", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(warehouses).orderBy(asc(warehouses.name));
  res.json(ListWarehousesResponse.parse(rows));
});

router.post("/warehouses", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateWarehouseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(warehouses).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/warehouses/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetWarehouseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(warehouses).where(eq(warehouses.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Magazzino non trovato" });
    return;
  }
  res.json(row);
});

router.patch("/warehouses/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateWarehouseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWarehouseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(warehouses)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(warehouses.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Magazzino non trovato" });
    return;
  }
  res.json(row);
});

router.delete("/warehouses/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteWarehouseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(warehouses).where(eq(warehouses.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Magazzino non trovato" });
    return;
  }
  res.sendStatus(204);
});

export default router;
