import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { budgetController } from "../controllers/budget.controller";
import { budgetSchema } from "../dto/budget.dto";

const router = Router();
router.use(authMiddleware);

router.get("/spending", budgetController.spending);
router.get("/", budgetController.list);
router.get("/:id", budgetController.getById);
router.post("/", validateBody(budgetSchema), budgetController.create);
router.put("/:id", validateBody(budgetSchema), budgetController.update);
router.delete("/:id", budgetController.delete);

export default router;
