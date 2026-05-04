import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import authRouter from "./auth";
import dataRouter from "./data";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dataRouter);
router.use(aiRouter);

export default router;
