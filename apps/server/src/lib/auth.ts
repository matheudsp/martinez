import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db";
import { openAPI, admin, bearer } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { Environment } from "@/env";

export const createAuth = (env: Environment) => {
  const db = createDb(env);
  return betterAuth({
    plugins: [admin(), bearer(), openAPI(), expo()],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
      "martinezapp://",
      ...(process.env.NODE_ENV === "development"
        ? [
            "exp://", // Trust all Expo URLs (prefix matching)
            "exp://**", // Trust all Expo URLs (wildcard matching)
            "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
          ]
        : []),
    ],
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
  });
};
