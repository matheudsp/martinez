import { createRouter } from "@/lib/create-app";
import { requireAuth } from "@/middlewares/require-auth";
import { zValidator } from "@hono/zod-validator";
import { updateMeSchema } from "./users.schema";
import { createDb } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const router = createRouter();

router.use("/api/users/*", requireAuth);

router.get("/api/users/me", (c) => {
  const currentUser = c.get("user")!;
  return c.json({ user: currentUser });
});

router.patch("/api/users/me", zValidator("json", updateMeSchema), async (c) => {
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
});

export default router;
