import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { AppError } from "./utils/errors";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import transactionRoutes from "./routes/transactions";
import productRoutes from "./routes/products";
import dashboardRoutes from "./routes/dashboard";
import reportRoutes from "./routes/reports";
import aiRoutes from "./routes/ai";
import budgetRoutes from "./routes/budgets";
import exportRoutes from "./routes/export";
import importRoutes from "./routes/import";
import salesRoutes from "./routes/sales";
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("short"));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/import", importRoutes);
app.use("/api/sales", salesRoutes);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
