import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { user, fuel, station, stationFuel } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@martinezposto.com";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_NAME = "Admin Martinez";

const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NODE_ENV: process.env.NODE_ENV || "development",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
};

const db = createDb(env as any);
const now = new Date();
const id = () => crypto.randomUUID();

async function seedAdmin() {
  console.log("👤 Seeding admin user...");

  const [existing] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL));

  if (existing) {
    if (existing.role !== "admin") {
      await db
        .update(user)
        .set({ role: "admin", updatedAt: now })
        .where(eq(user.id, existing.id));
      console.log("✅ Existing user promoted to admin");
    } else {
      console.log("ℹ️  Admin user already exists, skipping");
    }
    return;
  }

  const auth = createAuth(env as any);

  const result = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    },
  });

  const newUser = (result as any)?.user;
  if (!newUser?.id) {
    throw new Error("Failed to create admin user");
  }

  await db
    .update(user)
    .set({ role: "admin", updatedAt: now })
    .where(eq(user.id, newUser.id));

  console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
}

async function seed() {
  console.log("🌱 Seeding database...");

  const fuelData = [
    { id: id(), name: "Gasolina Comum", slug: "gasolina-comum", createdAt: now, updatedAt: now },
    { id: id(), name: "Gasolina Aditivada", slug: "gasolina-aditivada", createdAt: now, updatedAt: now },
    { id: id(), name: "Etanol", slug: "etanol", createdAt: now, updatedAt: now },
    { id: id(), name: "Diesel S10", slug: "diesel-s10", createdAt: now, updatedAt: now },
    { id: id(), name: "Diesel S500", slug: "diesel-s500", createdAt: now, updatedAt: now },
    { id: id(), name: "GNV", slug: "gnv", createdAt: now, updatedAt: now },
  ];

  await db.insert(fuel).values(fuelData).onConflictDoNothing();
  console.log("✅ Fuels seeded");

  // Fetch real IDs from DB (in case they already existed)
  const [gasolinaFuel] = await db.select().from(fuel).where(eq(fuel.slug, "gasolina-comum"));
  const [etanolFuel] = await db.select().from(fuel).where(eq(fuel.slug, "etanol"));

  // Check if demo station already exists
  const [existingStation] = await db
    .select({ id: station.id })
    .from(station)
    .where(eq(station.name, "Posto Martinez - Centro"));

  const stationId = existingStation?.id ?? id();
  await db
    .insert(station)
    .values({
      id: stationId,
      name: "Posto Martinez - Centro",
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      latitude: -23.5632,
      longitude: -46.6542,
      isActive: true,
      wifi: true,
      accessibility: true,
      convenienceStore: true,
      restaurant: false,
      electricCharging: false,
      carWash: true,
      open24h: true,
      tirePressure: true,
      bathroom: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();
  console.log("✅ Demo station seeded");

  await db
    .insert(stationFuel)
    .values([
      {
        id: id(),
        stationId,
        fuelId: gasolinaFuel.id,
        currentPrice: "5.990",
        isAvailable: true,
        updatedAt: now,
      },
      {
        id: id(),
        stationId,
        fuelId: etanolFuel.id,
        currentPrice: "3.990",
        isAvailable: true,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Station fuels seeded");

  await seedAdmin();

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
