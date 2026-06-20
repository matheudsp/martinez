import {
  pgTable,
  text,
  timestamp,
  boolean,
  doublePrecision,
  numeric,
  unique,
} from "drizzle-orm/pg-core";

// ---- Better Auth Tables ----

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role").default("user"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  city: text("city"),
  expoPushToken: text("expo_push_token"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ---- App Tables ----

export const station = pgTable("station", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  wifi: boolean("wifi").notNull().default(false),
  accessibility: boolean("accessibility").notNull().default(false),
  convenienceStore: boolean("convenience_store").notNull().default(false),
  restaurant: boolean("restaurant").notNull().default(false),
  electricCharging: boolean("electric_charging").notNull().default(false),
  carWash: boolean("car_wash").notNull().default(false),
  open24h: boolean("open24h").notNull().default(false),
  tirePressure: boolean("tire_pressure").notNull().default(false),
  bathroom: boolean("bathroom").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const fuel = pgTable("fuel", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const stationFuel = pgTable(
  "station_fuel",
  {
    id: text("id").primaryKey(),
    stationId: text("station_id")
      .notNull()
      .references(() => station.id, { onDelete: "cascade" }),
    fuelId: text("fuel_id")
      .notNull()
      .references(() => fuel.id, { onDelete: "cascade" }),
    currentPrice: numeric("current_price", {
      precision: 10,
      scale: 3,
    }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (t) => [unique("unique_station_fuel").on(t.stationId, t.fuelId)]
);

export const priceHistory = pgTable("price_history", {
  id: text("id").primaryKey(),
  stationFuelId: text("station_fuel_id")
    .notNull()
    .references(() => stationFuel.id, { onDelete: "cascade" }),
  stationId: text("station_id")
    .notNull()
    .references(() => station.id, { onDelete: "cascade" }),
  fuelId: text("fuel_id")
    .notNull()
    .references(() => fuel.id, { onDelete: "cascade" }),
  previousPrice: numeric("previous_price", { precision: 10, scale: 3 }),
  newPrice: numeric("new_price", { precision: 10, scale: 3 }).notNull(),
  changedAt: timestamp("changed_at").notNull(),
  changedById: text("changed_by_id")
    .notNull()
    .references(() => user.id),
});
