import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rootRouter from "./api/index.router";

const app = express();
const PORT = process.env.PORT;
const FRONTEND = process.env.FRONTEND;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND,
    credentials: true,
  }),
);
app.use("/api", rootRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log("API running on http://localhost:3001");
});
