import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { importService } from "../services/import.service";
import { BadRequestError } from "../utils/errors";

export const importController = {
  async transactions(req: AuthRequest, res: Response) {
    if (!req.file) throw new BadRequestError("File CSV harus diunggah");
    const result = await importService.transactions(
      req.userId!,
      req.file.buffer,
    );
    res.json({
      message: `Berhasil import ${result.imported} transaksi`,
      ...result,
    });
  },
};
