// types.ts
import type { Environment } from "@/env";
import type { createAuth } from "@/lib/auth";

type Auth = ReturnType<typeof createAuth>;
type InferredSession = Auth["$Infer"]["Session"];

export type AppUser = InferredSession["user"];
export type AppSession = InferredSession["session"];
export type UserRole = NonNullable<AppUser["role"]>;

export interface AppBindings {
  Bindings: Environment;
  Variables: {
    user: AppUser | null;
    session: AppSession | null;
  };
}
