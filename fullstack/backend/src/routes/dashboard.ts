import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();
router.use(authMiddleware);

router.get("/summary", dashboardController.summary);
router.get("/monthly", dashboardController.monthly);
router.get("/stats", dashboardController.stats);

export default router;
