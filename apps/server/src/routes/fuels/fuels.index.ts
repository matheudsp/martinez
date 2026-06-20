import { createRouter } from "@/lib/create-app";
import { requireAuth } from "@/middlewares/require-auth";
import { requireAdmin } from "@/middlewares/require-admin";
import { zValidator } from "@hono/zod-validator";
import { createFuelSchema, updateFuelSchema } from "./fuels.schema";
import { createDb } from "@/db";
import { fuel } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId, now } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";

const router = createRouter();

router.use("/api/fuels/*", requireAuth);

router.get("/api/fuels", async (c) => {
  const db = createDb(c.env);
  const fuels = await db.select().from(fuel).orderBy(fuel.name);
  return c.json({ fuels });
});

router.post(
  "/api/fuels",
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
  }
);

router.patch(
  "/api/fuels/:id",
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
  }
);

router.delete("/api/fuels/:id", requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = createDb(c.env);

  const [deleted] = await db.delete(fuel).where(eq(fuel.id, id)).returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "Fuel not found" });
  }

  return c.json({ message: "Fuel deleted" });
});

export default router;
