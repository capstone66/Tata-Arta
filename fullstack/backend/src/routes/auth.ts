import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { authController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../dto/auth.dto";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Terlalu banyak percobaan. Coba lagi 15 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.get("/profile", authMiddleware, authController.profile);

export default router;
