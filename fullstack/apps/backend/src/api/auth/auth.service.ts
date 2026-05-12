import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type {
  AuthResponse,
  LoginRequest,
  RegisterChildRequest,
  RegisterRequest,
} from "./auth.dto.ts";
import { prisma } from "../../../prisma/prisma.client.ts";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET tidak ditemukan di env");
}
const DUMMY_HASH = await bcrypt.hash("dummy_password", 10);

export const AuthService = {
  login: async (
    payload: LoginRequest,
  ): Promise<[AuthResponse | null, Error | null]> => {
    try {
      const parentUser = await prisma.parentUser.findUnique({
        where: {
          email: payload.email,
        },
      });

      const childUser = !parentUser
        ? await prisma.childUser.findUnique({ where: { email: payload.email } })
        : null;

      const foundUser = parentUser || childUser;
      const hashToCompare = foundUser?.password ?? DUMMY_HASH;
      const isMatch = await bcrypt.compare(payload.password, hashToCompare);

      if (!isMatch || !foundUser) {
        return [null, new Error("Email atau password salah")];
      }

      if ("isActive" in foundUser && !foundUser.isActive) {
        return [
          null,
          new Error("Akun tidak aktif, silahkan hubungi pemilik usaha"),
        ];
      }

      const token = jwt.sign(
        { id: foundUser.id, role: foundUser.role },
        JWT_SECRET!,
        {
          expiresIn: "1d",
        },
      );

      return [
        {
          token,
          user: {
            id: foundUser.id,
            email: foundUser.email,
            role: foundUser.role,
          },
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
      const existing = await prisma.parentUser.findUnique({
        where: { email: payload.email },
      });

      if (existing) {
        return [null, new Error("Email sudah terdaftar")];
      }

      const hashedpassword = await bcrypt.hash(payload.password, 10);
      const newUser = await prisma.parentUser.create({
        data: {
          email: payload.email,
          password: hashedpassword,
          role: "ADMIN",
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

  registerChild: async (
    payload: RegisterChildRequest,
    parentId: string,
  ): Promise<[string | null, Error | null]> => {
    try {
      const parent = await prisma.parentUser.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        return [null, new Error("Parent tidak ditemukan")];
      }

      const existingParent = await prisma.parentUser.findUnique({
        where: { email: payload.email },
      });

      const existingChild = await prisma.childUser.findUnique({
        where: { email: payload.email },
      });

      if (existingParent || existingChild) {
        return [null, new Error("Email sudah terdaftar")];
      }

      const hashedpassword = await bcrypt.hash(payload.password, 10);

      const newChild = await prisma.childUser.create({
        data: {
          name: payload.name,
          email: payload.email,
          password: hashedpassword,
          role: "USER",
          parent: {
            connect: { id: parentId },
          },
        },
      });

      return [newChild.id, null];
    } catch (e) {
      return [null, e as Error];
    }
  },
};
