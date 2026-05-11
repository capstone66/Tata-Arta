import { Router } from "express";
import { AuthController } from "../auth/auth.controller.ts";
import {
  LoginRequestSchema,
  RegisterChildRequestSchema,
  RegisterRequestSchema,
} from "../auth/auth.dto.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { authMiddleware } from "../../middleware/auth.middleware.ts";

const router = Router();

router.post("/login", validate(LoginRequestSchema), AuthController.login);
router.post(
  "/register",
  validate(RegisterRequestSchema),
  AuthController.register,
);
router.post("/logout", AuthController.logout);
router.post(
  "/children",
  authMiddleware,
  validate(RegisterChildRequestSchema),
  AuthController.registerChild,
);

export default router;
