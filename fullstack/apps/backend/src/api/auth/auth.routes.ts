import { Router } from "express";
import { AuthController } from "./auth.controller.ts";
import {
  LoginRequestSchema,
  RegisterChildRequestSchema,
  RegisterRequestSchema,
} from "./auth.dto.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import {
  authMiddleware,
  requireRole,
} from "../../middleware/auth.middleware.ts";

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
  requireRole("ADMIN"),
  validate(RegisterChildRequestSchema),
  AuthController.registerChild,
);

export default router;
