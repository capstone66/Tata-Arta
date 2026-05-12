import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const RegisterRequestSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterChildRequestSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
});

export type RegisterChildRequest = z.infer<typeof RegisterChildRequestSchema>;
