import { createRouter } from "@/lib/create-app";
import { requireAuth } from "@/middlewares/require-auth";
import { requireAdmin } from "@/middlewares/require-admin";
import { zValidator } from "@hono/zod-validator";
import {
  createStationSchema,
  updateStationSchema,
  listStationsQuerySchema,
} from "./stations.schema";
import { createDb } from "@/db";
import { station, stationFuel, fuel } from "@/db/schema";
import { eq, and, sql, asc } from "drizzle-orm";
import { generateId, now } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";

const router = createRouter();

router.use("/api/stations/*", requireAuth);

router.get("/api/stations", zValidator("query", listStationsQuerySchema), async (c) => {
  const db = createDb(c.env);
  const { lat, lng, radius, city: cityFilter, active } = c.req.valid("query");

  if (lat !== undefined && lng !== undefined) {
    const distanceExpr = sql<number>`
      (6371 * acos(
        LEAST(1.0,
          cos(radians(${lat})) * cos(radians(${station.latitude})) *
          cos(radians(${station.longitude}) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(${station.latitude}))
        )
      ))
    `;

    const stations = await db
      .select({
        id: station.id,
        name: station.name,
        address: station.address,
        city: station.city,
        latitude: station.latitude,
        longitude: station.longitude,
        isActive: station.isActive,
        wifi: station.wifi,
        accessibility: station.accessibility,
        convenienceStore: station.convenienceStore,
        restaurant: station.restaurant,
        electricCharging: station.electricCharging,
        carWash: station.carWash,
        open24h: station.open24h,
        tirePressure: station.tirePressure,
        bathroom: station.bathroom,
        createdAt: station.createdAt,
        updatedAt: station.updatedAt,
        distance: distanceExpr,
      })
      .from(station)
      .where(
        and(
          eq(station.isActive, active),
          sql`${distanceExpr} <= ${radius}`,
          cityFilter ? eq(station.city, cityFilter) : undefined
        )
      )
      .orderBy(asc(distanceExpr));

    return c.json({ stations });
  }

  const stations = await db
    .select()
    .from(station)
    .where(
      and(
        eq(station.isActive, active),
        cityFilter ? eq(station.city, cityFilter) : undefined
      )
    )
    .orderBy(asc(station.name));

  return c.json({ stations });
});

router.get("/api/stations/:id", async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env);

  const [stationData] = await db.select().from(station).where(eq(station.id, id));

  if (!stationData) {
    throw new HTTPException(404, { message: "Station not found" });
  }

  const fuels = await db
    .select({
      id: stationFuel.id,
      fuelId: stationFuel.fuelId,
      fuelName: fuel.name,
      fuelSlug: fuel.slug,
      currentPrice: stationFuel.currentPrice,
      isAvailable: stationFuel.isAvailable,
      updatedAt: stationFuel.updatedAt,
    })
    .from(stationFuel)
    .innerJoin(fuel, eq(fuel.id, stationFuel.fuelId))
    .where(eq(stationFuel.stationId, id));

  return c.json({
    station: stationData,
    fuels,
  });
});

router.post(
  "/api/stations",
  requireAdmin,
  zValidator("json", createStationSchema),
  async (c) => {
    const body = c.req.valid("json");
    const db = createDb(c.env);

    const [created] = await db
      .insert(station)
      .values({
        id: generateId(),
        ...body,
        createdAt: now(),
        updatedAt: now(),
      })
      .returning();

    return c.json({ station: created }, 201);
  }
);

router.patch(
  "/api/stations/:id",
  requireAdmin,
  zValidator("json", updateStationSchema),
  async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid("json");
    const db = createDb(c.env);

    const [updated] = await db
      .update(station)
      .set({ ...body, updatedAt: now() })
      .where(eq(station.id, id))
      .returning();

    if (!updated) {
      throw new HTTPException(404, { message: "Station not found" });
    }

    return c.json({ station: updated });
  }
);

router.delete("/api/stations/:id", requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env);

  const [deactivated] = await db
    .update(station)
    .set({ isActive: false, updatedAt: now() })
    .where(eq(station.id, id))
    .returning();

  if (!deactivated) {
    throw new HTTPException(404, { message: "Station not found" });
  }

  return c.json({ message: "Station deactivated", station: deactivated });
});

export default router;
