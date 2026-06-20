import { z } from "zod";

export const addFuelToStationSchema = z.object({
  fuelId: z.string().min(1),
  price: z.number().positive().multipleOf(0.001),
  isAvailable: z.boolean().default(true),
});

export const updateFuelPriceSchema = z.object({
  price: z.number().positive().multipleOf(0.001),
  isAvailable: z.boolean().optional(),
});
