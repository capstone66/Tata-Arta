import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { reportController } from "../controllers/report.controller";

const router = Router();
router.use(authMiddleware);

router.get("/profit-loss", reportController.profitLoss);
router.get("/cashflow", reportController.cashflow);

export default router;
