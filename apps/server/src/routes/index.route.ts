import { createRouter } from "@/lib/create-app";
import { describeRoute, zSchema } from "@/lib/openapi";
import { z } from "zod";

const router = createRouter();

router.get(
  "/",
  describeRoute({
    tags: ["Health"],
    summary: "Health check",
    description: "Returns API status",
    responses: {
      200: {
        description: "API is running",
        content: {
          "application/json": {
            schema: zSchema(z.object({ message: z.string() })),
          },
        },
      },
    },
  }),
  (c) => {
    return c.json({ message: "App API" }, 200);
  },
);

export default router;
