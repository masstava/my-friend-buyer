import { Router, type IRouter } from "express";
import { sql, desc, eq } from "drizzle-orm";
import {
  db,
  companies,
  stores,
  warehouses,
  suppliers,
  productSkus,
  stockMovements,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetDashboardRecentActivityResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get(
  "/dashboard/summary",
  requireAuth,
  async (_req, res): Promise<void> => {
    const [
      [{ count: cCompanies }],
      [{ count: cStores }],
      [{ count: cWarehouses }],
      [{ count: cSuppliers }],
      [{ count: cSkus }],
      [{ qty: unitsInStock }],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(companies),
      db.select({ count: sql<number>`count(*)::int` }).from(stores),
      db.select({ count: sql<number>`count(*)::int` }).from(warehouses),
      db.select({ count: sql<number>`count(*)::int` }).from(suppliers),
      db.select({ count: sql<number>`count(*)::int` }).from(productSkus),
      db
        .select({
          qty: sql<number>`coalesce(sum(case when ${stockMovements.movementType} = 'in' then ${stockMovements.quantity} when ${stockMovements.movementType} = 'out' then -${stockMovements.quantity} else 0 end), 0)::int`,
        })
        .from(stockMovements),
    ]);

    res.json(
      GetDashboardSummaryResponse.parse({
        companies: cCompanies,
        stores: cStores,
        warehouses: cWarehouses,
        suppliers: cSuppliers,
        skus: cSkus,
        unitsInStock,
      }),
    );
  },
);

router.get(
  "/dashboard/recent-activity",
  requireAuth,
  async (_req, res): Promise<void> => {
    const rows = await db
      .select({
        id: stockMovements.id,
        movementType: stockMovements.movementType,
        skuCode: productSkus.code,
        quantity: stockMovements.quantity,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .leftJoin(productSkus, eq(productSkus.id, stockMovements.skuId))
      .orderBy(desc(stockMovements.createdAt))
      .limit(20);

    res.json(GetDashboardRecentActivityResponse.parse(rows));
  },
);

export default router;
