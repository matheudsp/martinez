import { z } from "zod";

export const updateMeSchema = z.object({
  city: z.string().min(2).max(100).optional(),
  expoPushToken: z.string().min(1).max(255).optional(),
  name: z.string().min(2).max(100).optional(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.enum(["user", "admin"]),
  city: z.string().nullable(),
  expoPushToken: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
