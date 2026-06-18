import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import connectionsRouter from "./connections";
import conversationsRouter from "./conversations";
import emergencyRouter from "./emergency";
import themesRouter from "./themes";
import devicesRouter from "./devices";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(connectionsRouter);
router.use(conversationsRouter);
router.use(emergencyRouter);
router.use(themesRouter);
router.use(devicesRouter);

export default router;
