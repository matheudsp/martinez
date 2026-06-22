import { createRouter } from "@/lib/create-app";
import { requireAuth } from "@/middlewares/require-auth";
import { requireAdmin } from "@/middlewares/require-admin";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, zSchema, errorSchema } from "@/lib/openapi";
import {
  addFuelToStationSchema,
  updateFuelPriceSchema,
  stationFuelDetailSchema,
  priceHistorySchema,
} from "./prices.schema";
import { createDb } from "@/db";
import { station, fuel, stationFuel, priceHistory } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateId, now } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const router = createRouter();

router.use("/stations/:stationId/fuels*", requireAuth);

router.get(
  "/stations/:stationId/fuels",
  describeRoute({
    tags: ["Prices"],
    summary: "List station fuels",
    description:
      "Returns all fuels available at a station with their current prices",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Station fuels with prices",
        content: {
          "application/json": {
            schema: zSchema(
              z.object({
                fuels: z.array(
                  stationFuelDetailSchema.omit({ stationId: true }),
                ),
              }),
            ),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: { "application/json": { schema: errorSchema } },
      },
      404: {
        description: "Station not found",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
  async (c) => {
    const { stationId } = c.req.param();
    const db = createDb(c.env);

    const [stationData] = await db
      .select({ id: station.id })
      .from(station)
      .where(eq(station.id, stationId));

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
      .where(eq(stationFuel.stationId, stationId));

    return c.json({ fuels });
  },
);

router.post(
  "/stations/:stationId/fuels",
  describeRoute({
    tags: ["Prices"],
    summary: "Add fuel to station",
    description:
      "Adds a fuel type with an initial price to a station (admin only)",
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: zSchema(addFuelToStationSchema) },
      },
    },
    responses: {
      201: {
        description: "Fuel added to station",
        content: {
          "application/json": {
            schema: zSchema(z.object({ stationFuel: stationFuelDetailSchema })),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: { "application/json": { schema: errorSchema } },
      },
      403: {
        description: "Forbidden",
        content: { "application/json": { schema: errorSchema } },
      },
      404: {
        description: "Station or fuel not found",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
);

router.post(
  "/stations/:stationId/fuels",
  requireAdmin,
  zValidator("json", addFuelToStationSchema),
  async (c) => {
    const { stationId } = c.req.param();
    const body = c.req.valid("json");
    const admin = c.get("user")!;
    const db = createDb(c.env);

    const [stationData] = await db
      .select({ id: station.id })
      .from(station)
      .where(eq(station.id, stationId));

    if (!stationData) {
      throw new HTTPException(404, { message: "Station not found" });
    }

    const [fuelData] = await db
      .select({ id: fuel.id })
      .from(fuel)
      .where(eq(fuel.id, body.fuelId));

    if (!fuelData) {
      throw new HTTPException(404, { message: "Fuel not found" });
    }

    const stationFuelId = generateId();
    const priceStr = body.price.toFixed(3);

    const [created] = await db
      .insert(stationFuel)
      .values({
        id: stationFuelId,
        stationId,
        fuelId: body.fuelId,
        currentPrice: priceStr,
        isAvailable: body.isAvailable,
        updatedAt: now(),
      })
      .returning();

    await db.insert(priceHistory).values({
      id: generateId(),
      stationFuelId,
      stationId,
      fuelId: body.fuelId,
      previousPrice: null,
      newPrice: priceStr,
      changedAt: now(),
      changedById: admin.id,
    });

    return c.json({ stationFuel: created }, 201);
  },
);

router.patch(
  "/stations/:stationId/fuels/:fuelId/price",
  describeRoute({
    tags: ["Prices"],
    summary: "Update fuel price",
    description: "Updates the price of a fuel at a station (admin only)",
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: zSchema(updateFuelPriceSchema) },
      },
    },
    responses: {
      200: {
        description: "Price updated",
        content: {
          "application/json": {
            schema: zSchema(z.object({ stationFuel: stationFuelDetailSchema })),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: { "application/json": { schema: errorSchema } },
      },
      403: {
        description: "Forbidden",
        content: { "application/json": { schema: errorSchema } },
      },
      404: {
        description: "Fuel not registered for this station",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
);

router.patch(
  "/stations/:stationId/fuels/:fuelId/price",
  requireAdmin,
  zValidator("json", updateFuelPriceSchema),
  async (c) => {
    const { stationId, fuelId } = c.req.param();
    const body = c.req.valid("json");
    const admin = c.get("user")!;
    const db = createDb(c.env);

    const [existing] = await db
      .select()
      .from(stationFuel)
      .where(
        and(
          eq(stationFuel.stationId, stationId),
          eq(stationFuel.fuelId, fuelId),
        ),
      );

    if (!existing) {
      throw new HTTPException(404, {
        message: "Fuel not registered for this station",
      });
    }

    const newPriceStr = body.price.toFixed(3);
    const changedAt = now();

    const [updated] = await db
      .update(stationFuel)
      .set({
        currentPrice: newPriceStr,
        ...(body.isAvailable !== undefined && {
          isAvailable: body.isAvailable,
        }),
        updatedAt: changedAt,
      })
      .where(eq(stationFuel.id, existing.id))
      .returning();

    await db.insert(priceHistory).values({
      id: generateId(),
      stationFuelId: existing.id,
      stationId,
      fuelId,
      previousPrice: existing.currentPrice,
      newPrice: newPriceStr,
      changedAt,
      changedById: admin.id,
    });

    return c.json({ stationFuel: updated });
  },
);

router.delete(
  "/stations/:stationId/fuels/:fuelId",
  requireAdmin,
  describeRoute({
    tags: ["Prices"],
    summary: "Remove fuel from station",
    description: "Removes a fuel type from a station (admin only)",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Fuel removed",
        content: {
          "application/json": {
            schema: zSchema(z.object({ message: z.string() })),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: { "application/json": { schema: errorSchema } },
      },
      403: {
        description: "Forbidden",
        content: { "application/json": { schema: errorSchema } },
      },
      404: {
        description: "Fuel not registered for this station",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
  async (c) => {
    const { stationId, fuelId } = c.req.param();
    const db = createDb(c.env);

    const [existing] = await db
      .select({ id: stationFuel.id })
      .from(stationFuel)
      .where(
        and(
          eq(stationFuel.stationId, stationId),
          eq(stationFuel.fuelId, fuelId),
        ),
      );

    if (!existing) {
      throw new HTTPException(404, {
        message: "Fuel not registered for this station",
      });
    }

    await db.delete(stationFuel).where(eq(stationFuel.id, existing.id));

    return c.json({ message: "Fuel removed from station" });
  },
);

router.get(
  "/stations/:stationId/fuels/:fuelId/history",
  describeRoute({
    tags: ["Prices"],
    summary: "Get price history",
    description: "Returns the price history for a fuel at a station",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Price history",
        content: {
          "application/json": {
            schema: zSchema(z.object({ history: z.array(priceHistorySchema) })),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
  async (c) => {
    const { stationId, fuelId } = c.req.param();
    const db = createDb(c.env);

    const history = await db
      .select({
        id: priceHistory.id,
        previousPrice: priceHistory.previousPrice,
        newPrice: priceHistory.newPrice,
        changedAt: priceHistory.changedAt,
        changedById: priceHistory.changedById,
      })
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.stationId, stationId),
          eq(priceHistory.fuelId, fuelId),
        ),
      )
      .orderBy(desc(priceHistory.changedAt))
      .limit(50);

    return c.json({ history });
  },
);

export default router;
