import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { saleController } from "../controllers/sale.controller";
import { createSaleSchema } from "../dto/sale.dto";

const router = Router();
router.use(authMiddleware);

router.get("/", saleController.list);
router.get("/:id", saleController.getById);
router.post("/", validateBody(createSaleSchema), saleController.create);
router.delete("/:id", saleController.delete);

export default router;
