import { createRouter } from "@/lib/create-app";
import { requireAuth } from "@/middlewares/require-auth";
import { requireAdmin } from "@/middlewares/require-admin";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, zSchema, errorSchema } from "@/lib/openapi";
import { createFuelSchema, updateFuelSchema, fuelSchema } from "./fuels.schema";
import { createDb } from "@/db";
import { fuel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId, now } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const router = createRouter();

router.use("/fuels/*", requireAuth);

router.get(
  "/fuels",
  describeRoute({
    tags: ["Fuels"],
    summary: "List fuels",
    description: "Returns all available fuel types",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "List of fuels",
        content: {
          "application/json": {
            schema: zSchema(z.object({ fuels: z.array(fuelSchema) })),
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
    const db = createDb(c.env);
    const fuels = await db.select().from(fuel).orderBy(fuel.name);
    return c.json({ fuels });
  },
);

router.post(
  "/fuels",
  describeRoute({
    tags: ["Fuels"],
    summary: "Create fuel",
    description: "Creates a new fuel type (admin only)",
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: zSchema(createFuelSchema) },
      },
    },
    responses: {
      201: {
        description: "Fuel created",
        content: {
          "application/json": {
            schema: zSchema(z.object({ fuel: fuelSchema })),
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
    },
  }),
);

router.post(
  "/fuels",
  requireAdmin,
  zValidator("json", createFuelSchema),
  async (c) => {
    const body = c.req.valid("json");
    const db = createDb(c.env);

    const [created] = await db
      .insert(fuel)
      .values({
        id: generateId(),
        name: body.name,
        slug: body.slug,
        createdAt: now(),
        updatedAt: now(),
      })
      .returning();

    return c.json({ fuel: created }, 201);
  },
);

router.patch(
  "/fuels/:id",
  describeRoute({
    tags: ["Fuels"],
    summary: "Update fuel",
    description: "Updates an existing fuel type (admin only)",
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: zSchema(updateFuelSchema) },
      },
    },
    responses: {
      200: {
        description: "Fuel updated",
        content: {
          "application/json": {
            schema: zSchema(z.object({ fuel: fuelSchema })),
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
        description: "Fuel not found",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
);

router.patch(
  "/fuels/:id",
  requireAdmin,
  zValidator("json", updateFuelSchema),
  async (c) => {
    const { id } = c.req.param();
    const body = c.req.valid("json");
    const db = createDb(c.env);

    const [updated] = await db
      .update(fuel)
      .set({ ...body, updatedAt: now() })
      .where(eq(fuel.id, id))
      .returning();

    if (!updated) {
      throw new HTTPException(404, { message: "Fuel not found" });
    }

    return c.json({ fuel: updated });
  },
);

router.delete(
  "/fuels/:id",
  requireAdmin,
  describeRoute({
    tags: ["Fuels"],
    summary: "Delete fuel",
    description: "Deletes a fuel type (admin only)",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Fuel deleted",
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
        description: "Fuel not found",
        content: { "application/json": { schema: errorSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.param();
    const db = createDb(c.env);

    const [deleted] = await db.delete(fuel).where(eq(fuel.id, id)).returning();

    if (!deleted) {
      throw new HTTPException(404, { message: "Fuel not found" });
    }

    return c.json({ message: "Fuel deleted" });
  },
);

export default router;
