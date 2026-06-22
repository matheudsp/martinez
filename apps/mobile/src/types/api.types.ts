// ─── Primitives ───────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";

// ─── User ─────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  city: string | null;
  expoPushToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserInput = {
  name?: string;
  city?: string;
  expoPushToken?: string;
};

// ─── Fuel ─────────────────────────────────────────────────────────────────────

export type Fuel = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFuelInput = {
  name: string;
  slug: string;
};

export type UpdateFuelInput = {
  name?: string;
  slug?: string;
};

// ─── Station ──────────────────────────────────────────────────────────────────

export type Station = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  wifi: boolean;
  accessibility: boolean;
  convenienceStore: boolean;
  restaurant: boolean;
  electricCharging: boolean;
  carWash: boolean;
  open24h: boolean;
  tirePressure: boolean;
  bathroom: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number;
};

export type StationFuel = {
  id: string;
  fuelId: string;
  fuelName: string;
  fuelSlug: string;
  currentPrice: string;
  isAvailable: boolean;
  updatedAt: string;
};

export type StationWithFuels = {
  station: Station;
  fuels: StationFuel[];
};

export type StationsFilter = {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  active?: boolean;
};

export type CreateStationInput = {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  wifi?: boolean;
  accessibility?: boolean;
  convenienceStore?: boolean;
  restaurant?: boolean;
  electricCharging?: boolean;
  carWash?: boolean;
  open24h?: boolean;
  tirePressure?: boolean;
  bathroom?: boolean;
};

export type UpdateStationInput = Partial<CreateStationInput>;

// ─── Prices ───────────────────────────────────────────────────────────────────

export type PriceHistory = {
  id: string;
  previousPrice: string | null;
  newPrice: string;
  changedAt: string;
  changedById: string;
};

export type SetPriceInput = {
  price: string;
};

// ─── API Response Envelopes ───────────────────────────────────────────────────

export type UserResponse = { user: User };
export type FuelsResponse = { fuels: Fuel[] };
export type FuelResponse = { fuel: Fuel };
export type StationsResponse = { stations: Station[] };
export type StationResponse = { station: Station };
export type StationWithFuelsResponse = StationWithFuels;
export type PriceHistoryResponse = { history: PriceHistory[] };
export type MessageResponse = { message: string };
