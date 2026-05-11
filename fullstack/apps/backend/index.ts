import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import authRouter from "./src/api/router/auth.router.ts";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("hello from here 3");
});
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log("API running on http://localhost:3001");
});
