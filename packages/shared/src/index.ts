// import { z } from "zod";

// export const idSchema = z.string().min(1);

// export const paginationSchema = z.object({
//   page: z.coerce.number().int().min(1).default(1),
//   limit: z.coerce.number().int().min(1).max(100).default(20),
// });

// export const timestampSchema = z.string().datetime();

// export const metaSchema = z.object({
//   createdAt: timestampSchema,
//   updatedAt: timestampSchema.optional(),
// });

// export type PaginationInput = z.infer<typeof paginationSchema>;
// export type Meta = z.infer<typeof metaSchema>;
