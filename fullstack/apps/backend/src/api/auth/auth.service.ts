import { auth } from "../../lib/auth.ts";
import type { RegisterChildRequest } from "./auth.dto.ts";
import { prisma } from "../../../prisma/prisma.client.ts";

export const AuthService = {
  registerChild: async (
    payload: RegisterChildRequest,
    parentId: string,
  ): Promise<[string | null, Error | null]> => {
    try {
      const parent = await prisma.user.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        return [null, new Error("Parent tidak ditemukan")];
      }

      if (parent.role !== "ADMIN") {
        return [null, new Error("Parent bukan ADMIN")];
      }

      const existing = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (existing) {
        return [null, new Error("Email sudah terdaftar")];
      }

      const result = await auth.api.signUpEmail({
        body: {
          email: payload.email,
          password: payload.password,
          name: payload.name,
        },
      });

      await prisma.user.update({
        where: { id: result.user.id },
        data: {
          role: "USER",
          parentId: parentId,
          isActive: true,
        },
      });

      return [result.user.id, null];
    } catch (e) {
      return [null, e as Error];
    }
  },
};
