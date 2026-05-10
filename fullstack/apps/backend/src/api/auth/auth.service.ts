import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../../generated/prisman";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./auth.dto";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const AuthService = {
  login: async (
    payload: LoginRequest,
  ): Promise<[AuthResponse | null, Error | null]> => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        return [null, new Error("User tidak ditemukan")];
      }

      const isMatch = await bcrypt.compare(payload.password, user.password);
      if (!isMatch) {
        return [null, new Error("Password salah")];
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET!, {
        expiresIn: "1d",
      });

      return [
        {
          token,
          user: { id: user.id, email: user.email, role: user.role },
        },
        null,
      ];
    } catch (e) {
      return [null, e as Error];
    }
  },

  register: async (
    payload: RegisterRequest,
  ): Promise<[string | null, Error | null]> => {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (existing) {
        return [null, new Error("Email sudah terdaftar")];
      }

      const hashedpassword = await bcrypt.hash(payload.password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: payload.email,
          password: hashedpassword,
          role: payload.role,
          userProfile: {
            create: { name: payload.name },
          },
        },
      });

      return [newUser.id, null];
    } catch (e) {
      return [null, e as Error];
    }
  },
};
