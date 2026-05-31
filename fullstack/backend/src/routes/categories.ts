import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { categoryController } from "../controllers/category.controller";
import { categorySchema, categoryQuerySchema } from "../dto/category.dto";

const router = Router();
router.use(authMiddleware);

router.get("/", validateQuery(categoryQuerySchema), categoryController.list);
router.get("/:id", categoryController.getById);
router.post("/", validateBody(categorySchema), categoryController.create);
router.put("/:id", validateBody(categorySchema), categoryController.update);
router.delete("/:id", categoryController.delete);

export default router;
