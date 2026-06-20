import { z } from "zod";

export const updateMeSchema = z.object({
  city: z.string().min(2).max(100).optional(),
  expoPushToken: z.string().min(1).max(255).optional(),
  name: z.string().min(2).max(100).optional(),
});
