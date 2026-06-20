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

export const stationFuelDetailSchema = z.object({
  id: z.string(),
  stationId: z.string(),
  fuelId: z.string(),
  currentPrice: z.string(),
  isAvailable: z.boolean(),
  updatedAt: z.string(),
});

export const priceHistorySchema = z.object({
  id: z.string(),
  previousPrice: z.string().nullable(),
  newPrice: z.string(),
  changedAt: z.string(),
  changedById: z.string(),
});
