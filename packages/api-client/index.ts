import { hc } from "hono/client";

export const createApiClient = (baseUrl: string) => {
  return hc(baseUrl);
};
