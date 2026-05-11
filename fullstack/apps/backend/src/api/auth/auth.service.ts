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

export const AuthService = {
  login: async (
    payload: LoginRequest,
  ): Promise<[AuthResponse | null, Error | null]> => {
    try {
      const parentUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      const childUser = !parentUser
        ? await prisma.childUser.findUnique({ where: { email: payload.email } })
        : null;

      const foundUser = parentUser || childUser;

      if (!foundUser) {
        return [null, new Error("User tidak ditemukan")];
      }

      const isMatch = await bcrypt.compare(
        payload.password,
        foundUser.password,
      );
      if (!isMatch) {
        return [null, new Error("Email atau password salah")];
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

  registerChild: async (
    payload: RegisterChildRequest,
    parentId: string,
  ): Promise<[string | null, Error | null]> => {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      const existingChild = await prisma.childUser.findUnique({
        where: { email: payload.email },
      });

      if (existingUser || existingChild) {
        return [null, new Error("Email sudah terdaftar")];
      }

      const hashedpassword = await bcrypt.hash(payload.password, 10);

      const newChild = await prisma.childUser.create({
        data: {
          ...payload,
          email: payload.email,
          password: hashedpassword,
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
