import type { NextFunction, Request, Response } from "express";
import z from "zod";
import type { ZodObject, ZodRawShape } from "zod";

export const validate =
  <T extends ZodRawShape>(schema: ZodObject<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flattenError = z.flattenError(result.error).fieldErrors;
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: flattenError,
      });
    }

    res.locals.dto = result.data;
    next();
  };
