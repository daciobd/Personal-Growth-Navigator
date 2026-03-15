import { Router, type IRouter } from "express";
import healthRouter from "./health";
import planRouter from "./plan";
import adminRouter from "./admin";
import dailyRouter from "./daily";
import coachRouter from "./coach";
import assessmentRouter from "./assessment";
import authRouter from "./auth";
import assessmentReportRouter from "./assessmentReport";

const router: IRouter = Router();

router.use(healthRouter);
router.use(planRouter);
router.use(adminRouter);
router.use(dailyRouter);
router.use(coachRouter);
router.use(assessmentRouter);
router.use(authRouter);
router.use(assessmentReportRouter);

export default router;
