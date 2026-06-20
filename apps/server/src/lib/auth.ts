import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";
import { openAPI, admin, bearer } from "better-auth/plugins";
import { Environment } from "@/env";

export const createAuth = (env: Environment) => {
  const db = createDb(env);
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    user: {
      additionalFields: {
        city: {
          type: "string",
          required: false,
          defaultValue: null,
          input: true,
        },
        expoPushToken: {
          type: "string",
          required: false,
          defaultValue: null,
          input: true,
        },
      },
    },
    plugins: [admin(), bearer(), openAPI()],
  });
};