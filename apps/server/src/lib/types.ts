import type { Environment } from "@/env";

export type UserRole = "user" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  city: string | null;
  expoPushToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSession {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
}

export interface AppBindings {
  Bindings: Environment;
  Variables: {
    user: AppUser | null;
    session: AppSession | null;
  };
}
