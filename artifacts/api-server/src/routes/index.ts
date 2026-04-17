import { Router, type IRouter } from "express";
import healthRouter from "./health";
import meRouter from "./me";
import companiesRouter from "./companies";
import storesRouter from "./stores";
import warehousesRouter from "./warehouses";
import suppliersRouter from "./suppliers";
import skusRouter from "./skus";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(companiesRouter);
router.use(storesRouter);
router.use(warehousesRouter);
router.use(suppliersRouter);
router.use(skusRouter);
router.use(dashboardRouter);

export default router;
