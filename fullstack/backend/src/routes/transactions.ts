import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { transactionController } from "../controllers/transaction.controller";
import { transactionSchema } from "../dto/transaction.dto";

const router = Router();
router.use(authMiddleware);

router.get("/", transactionController.list);
router.get("/:id", transactionController.getById);
router.post("/", validateBody(transactionSchema), transactionController.create);
router.put("/:id", validateBody(transactionSchema), transactionController.update);
router.delete("/:id", transactionController.delete);

export default router;
