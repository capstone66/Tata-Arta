import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { productController } from "../controllers/product.controller";
import { productSchema } from "../dto/product.dto";

const router = Router();
router.use(authMiddleware);

router.get("/search", productController.search);
router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", validateBody(productSchema), productController.create);
router.put("/:id", validateBody(productSchema), productController.update);
router.delete("/:id", productController.delete);

export default router;
