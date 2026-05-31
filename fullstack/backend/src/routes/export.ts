import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { exportController } from "../controllers/export.controller";

const router = Router();
router.use(authMiddleware);

router.get("/transactions/csv", exportController.transactionsCsv);
router.get("/products/csv", exportController.productsCsv);

export default router;
