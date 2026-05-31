import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth";
import { importController } from "../controllers/import.controller";

const router = Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/transactions", upload.single("file"), importController.transactions);

export default router;
