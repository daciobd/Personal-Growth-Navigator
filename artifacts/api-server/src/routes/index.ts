import { Router, type IRouter } from "express";
import healthRouter from "./health";
import planRouter from "./plan";
import adminRouter from "./admin";
import dailyRouter from "./daily";
import coachRouter from "./coach";

const router: IRouter = Router();

router.use(healthRouter);
router.use(planRouter);
router.use(adminRouter);
router.use(dailyRouter);
router.use(coachRouter);

export default router;
