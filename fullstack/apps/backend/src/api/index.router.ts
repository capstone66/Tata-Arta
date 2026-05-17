import { Router } from "express";
import authRoutes from "./auth/auth.routes.ts";
const rootRouter = Router();

rootRouter.use("/test", authRoutes);

export default rootRouter;
