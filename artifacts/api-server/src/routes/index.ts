import { Router, type IRouter } from "express";
import healthRouter from "./health";
import planRouter from "./plan";
import adminRouter from "./admin";
import dailyRouter from "./daily";
import coachRouter from "./coach";
import assessmentRouter from "./assessment";

const router: IRouter = Router();

router.use(healthRouter);
router.use(planRouter);
router.use(adminRouter);
router.use(dailyRouter);
router.use(coachRouter);
router.use(assessmentRouter);

export default router;
