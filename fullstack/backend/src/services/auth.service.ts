import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { generateToken } from "../middleware/auth";
import { BadRequestError, UnauthorizedError } from "../utils/errors";

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestError("Email sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = generateToken(user.id);
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError("Email atau password salah");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError("Email atau password salah");

    const token = generateToken(user.id);
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return user;
  },
};
