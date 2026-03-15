import { Router, type IRouter } from "express";
import healthRouter from "./health";
import planRouter from "./plan";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(planRouter);
router.use(adminRouter);

export default router;
