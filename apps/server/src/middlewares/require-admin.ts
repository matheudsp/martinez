import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AppBindings } from "@/lib/types";

export const requireAdmin = createMiddleware<AppBindings>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  if (user.role !== "admin") {
    throw new HTTPException(403, {
      message: "Forbidden: Admin access required",
    });
  }
  return next();
});
