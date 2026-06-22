import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { ENV } from "./env";

export const authClient = createAuthClient({
  baseURL: ENV.API_URL,
  plugins: [
    expoClient({
      scheme: "martinezapp",
      storagePrefix: "martinezapp-auth",
      storage: SecureStore,
    }),
  ],
});
