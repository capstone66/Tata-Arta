import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./api/index.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const PORT = process.env.PORT;
const FRONTEND = process.env.FRONTEND;

app.use(
  cors({
    origin: FRONTEND,
    credentials: true,
  }),
);

app.all("/api/v1/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", rootRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log("API running on http://localhost:3001");
});
