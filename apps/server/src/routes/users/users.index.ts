import { createRouter } from "@/lib/create-app";
import { requireAuth } from "@/middlewares/require-auth";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, zSchema, errorSchema } from "@/lib/openapi";
import { updateMeSchema, userSchema } from "./users.schema";
import { createDb } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const router = createRouter();

router.use("/api/users/*", requireAuth);

router.get(
  "/api/users/me",
  describeRoute({
    tags: ["Users"],
    summary: "Get current user",
    description: "Returns the profile of the authenticated user",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "User profile",
        content: {
          "application/json": {
            schema: zSchema(z.object({ user: userSchema })),
          },
        },
      },
      401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
    },
  }),
  (c) => {
    const currentUser = c.get("user")!;
    return c.json({ user: currentUser });
  }
);

router.patch(
  "/api/users/me",
  describeRoute({
    tags: ["Users"],
    summary: "Update current user",
    description: "Updates the profile of the authenticated user",
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": { schema: zSchema(updateMeSchema) },
      },
    },
    responses: {
      200: {
        description: "Updated user profile",
        content: {
          "application/json": {
            schema: zSchema(z.object({ user: userSchema })),
          },
        },
      },
      401: { description: "Unauthorized", content: { "application/json": { schema: errorSchema } } },
      404: { description: "User not found", content: { "application/json": { schema: errorSchema } } },
    },
  })
);

router.patch(
  "/api/users/me",
  zValidator("json", updateMeSchema),
  async (c) => {
    const currentUser = c.get("user")!;
    const body = c.req.valid("json");
    const db = createDb(c.env);

    const [updated] = await db
      .update(user)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.expoPushToken !== undefined && {
          expoPushToken: body.expoPushToken,
        }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id))
      .returning();

    if (!updated) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return c.json({ user: updated });
  }
);

export default router;
