import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, companies } from "@workspace/db";
import {
  ListCompaniesResponse,
  CreateCompanyBody,
  GetCompanyParams,
  GetCompanyResponse,
  UpdateCompanyParams,
  UpdateCompanyBody,
  DeleteCompanyParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/companies", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(companies).orderBy(asc(companies.name));
  res.json(ListCompaniesResponse.parse(rows));
});

router.post("/companies", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(companies).values(parsed.data).returning();
  res.status(201).json(GetCompanyResponse.parse(row));
});

router.get("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(companies).where(eq(companies.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Società non trovata" });
    return;
  }
  res.json(GetCompanyResponse.parse(row));
});

router.patch("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(companies)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(companies.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Società non trovata" });
    return;
  }
  res.json(GetCompanyResponse.parse(row));
});

router.delete("/companies/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(companies).where(eq(companies.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Società non trovata" });
    return;
  }
  res.sendStatus(204);
});

export default router;
