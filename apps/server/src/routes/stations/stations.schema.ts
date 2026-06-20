import { z } from "zod";

export const createStationSchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isActive: z.boolean().default(true),
  wifi: z.boolean().default(false),
  accessibility: z.boolean().default(false),
  convenienceStore: z.boolean().default(false),
  restaurant: z.boolean().default(false),
  electricCharging: z.boolean().default(false),
  carWash: z.boolean().default(false),
  open24h: z.boolean().default(false),
  tirePressure: z.boolean().default(false),
  bathroom: z.boolean().default(false),
});

export const updateStationSchema = createStationSchema.partial();

export const listStationsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(500).default(50),
  city: z.string().optional(),
  active: z.coerce.boolean().default(true),
});
