import type { Request, Response } from "express";
import z from "zod";
import { LoginRequestSchema, RegisterRequestSchema } from "./auth.dto";
import { AuthService } from "./auth.service";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const parseResult = LoginRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        status: "error",
        errors: z.flattenError(parseResult.error).fieldErrors,
      });
    }

    const [data, err] = await AuthService.login(parseResult.data);

    if (err) {
      return res.status(401).json({
        status: "error",
        message: err.message,
      });
    }

    return res.status(200).json({
      status: "success",
      data,
    });
  },

  register: async (req: Request, res: Response) => {
    const parseResult = RegisterRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        status: "error",
        errors: z.flattenError(parseResult.error).fieldErrors,
      });
    }

    const [data, err] = await AuthService.register(parseResult.data);

    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }

    return res.status(201).json({
      status: "success",
      data,
    });
  },
};
