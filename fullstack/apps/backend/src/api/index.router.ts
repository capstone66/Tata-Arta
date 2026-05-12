import { Router } from "express";
import authRoutes from "./auth/auth.routes.ts";
const rootRouter = Router();

rootRouter.use("/v1/auth", authRoutes);

export default rootRouter;
