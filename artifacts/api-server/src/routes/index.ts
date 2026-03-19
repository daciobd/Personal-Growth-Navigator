// artifacts/api-server/src/routes/index.ts
import { Router } from "express";
import healthRouter     from "./health.js";
import planRouter       from "./plan.js";
import adminRouter      from "./admin.js";
import dailyRouter      from "./daily.js";
import coachRouter      from "./coach.js";
import assessmentRouter from "./assessment.js";
import authRouter       from "./auth.js";
import journeysRouter   from "./journeys.js";
import jornadaRouter    from "./jornada.js";
import behavioralRouter from "./behavioral.js";

const router = Router();

router.use(healthRouter);
router.use("/auth",       authRouter);
router.use("/plan",       planRouter);
router.use("/admin",      adminRouter);
router.use("/daily",      dailyRouter);
router.use("/coach",      coachRouter);
router.use("/assessment", assessmentRouter);
router.use("/journeys",   journeysRouter);
router.use("/jornada",    jornadaRouter);
router.use("/behavioral", behavioralRouter);

export default router;
