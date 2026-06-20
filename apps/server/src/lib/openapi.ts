import { zodToJsonSchema } from "zod-to-json-schema";
import { describeRoute as _describeRoute, type DescribeRouteOptions } from "hono-openapi";
import type { MiddlewareHandler } from "hono";
import { z } from "zod";

/** Converts a Zod schema to an OpenAPI-compatible JSON Schema object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zSchema(schema: z.ZodTypeAny): any {
  // @ts-expect-error - zodToJsonSchema types are excessively deep
  const result = zodToJsonSchema(schema, { target: "openApi3" }) as any;
  delete result.$schema;
  return result;
}

/**
 * Wraps hono-openapi's describeRoute returning MiddlewareHandler<any> so it
 * can be registered as a standalone route call without disrupting Hono's type
 * inference chain when used alongside zValidator.
 *
 * Usage: register as a separate router.METHOD(path, describeRoute({...})) call
 * before the actual handler chain.
 */
export const describeRoute = (spec: DescribeRouteOptions): MiddlewareHandler<any> =>
  _describeRoute(spec) as MiddlewareHandler<any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorSchema: any = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
};
