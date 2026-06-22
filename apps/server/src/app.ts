import createApp from "@/lib/create-app";
import index from "@/routes/index.route";
import auth from "@/routes/auth/auth.index";
import users from "@/routes/users/users.index";
import fuels from "@/routes/fuels/fuels.index";
import stations from "@/routes/stations/stations.index";
import prices from "@/routes/prices/prices.index";
import { openAPIRouteHandler } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import type { Hono } from "hono";

const app = createApp();

const routes = [index, auth, users, fuels, stations, prices] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

app.get(
  "/api/openapi",
  openAPIRouteHandler(app as Hono<any>, {
    documentation: {
      info: {
        title: "Martinez API",
        version: "1.0.0",
        description: "Gas station fuel price tracker API",
      },
      servers: [{ url: "http://localhost:3000", description: "Local" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            description: "Better Auth session token",
          },
        },
      },
    },
  }),
);

app.get(
  "/api/docs",
  apiReference({
    spec: { url: "/api/openapi" },
    pageTitle: "Martinez API Docs",
    authentication: {
      preferredSecurityScheme: "bearerAuth",
      securitySchemes: {
        bearerAuth: { token: "" },
      },
    },
  }),
);

export default app;
