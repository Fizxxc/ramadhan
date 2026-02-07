import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
});

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Minimal 6 karakter"),
  confirm: z.string().min(6, "Minimal 6 karakter"),
}).refine((v) => v.password === v.confirm, { message: "Konfirmasi kata sandi tidak sama", path: ["confirm"] });
