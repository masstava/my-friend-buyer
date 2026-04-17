import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, suppliers } from "@workspace/db";
import {
  ListSuppliersResponse,
  CreateSupplierBody,
  GetSupplierParams,
  UpdateSupplierParams,
  UpdateSupplierBody,
  DeleteSupplierParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/suppliers", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(suppliers).orderBy(asc(suppliers.name));
  res.json(ListSuppliersResponse.parse(rows));
});

router.post("/suppliers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(suppliers).values(parsed.data).returning();
  res.status(201).json(row);
});

router.get("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetSupplierParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(suppliers).where(eq(suppliers.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Fornitore non trovato" });
    return;
  }
  res.json(row);
});

router.patch("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(suppliers)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(suppliers.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Fornitore non trovato" });
    return;
  }
  res.json(row);
});

router.delete("/suppliers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteSupplierParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(suppliers).where(eq(suppliers.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Fornitore non trovato" });
    return;
  }
  res.sendStatus(204);
});

export default router;
