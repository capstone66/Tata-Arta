import { Router } from "express";
import authRoutes from "./auth/auth.routes.ts";
const rootRouter = Router();

rootRouter.use("/auth", authRoutes);

export default rootRouter;
