import { authClient } from "@/lib/auth-client";
import { ENV } from "@/lib/env";
import type {
  CreateFuelInput,
  CreateStationInput,
  FuelResponse,
  FuelsResponse,
  MessageResponse,
  PriceHistoryResponse,
  SetPriceInput,
  StationResponse,
  StationWithFuelsResponse,
  StationsFilter,
  StationsResponse,
  UpdateFuelInput,
  UpdateStationInput,
  UpdateUserInput,
  UserResponse,
} from "@/types/api.types";

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Get the current Better Auth session token for Bearer auth
  const session = await authClient.getSession();
  const token = session?.data?.session?.token;

  const response = await fetch(`${ENV.API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new ApiError(response.status, body.message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : "";
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: (): Promise<UserResponse> => apiFetch("/api/users/me"),

  updateMe: (input: UpdateUserInput): Promise<UserResponse> =>
    apiFetch("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

// ─── Fuels ────────────────────────────────────────────────────────────────────

export const fuelsApi = {
  list: (): Promise<FuelsResponse> => apiFetch("/api/fuels"),

  create: (input: CreateFuelInput): Promise<FuelResponse> =>
    apiFetch("/api/fuels", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateFuelInput): Promise<FuelResponse> =>
    apiFetch(`/api/fuels/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (id: string): Promise<MessageResponse> => apiFetch(`/api/fuels/${id}`, { method: "DELETE" }),
};

// ─── Stations ─────────────────────────────────────────────────────────────────

export const stationsApi = {
  list: (filter?: StationsFilter): Promise<StationsResponse> => apiFetch(`/api/stations${buildQuery(filter ?? {})}`),

  get: (id: string): Promise<StationWithFuelsResponse> => apiFetch(`/api/stations/${id}`),

  create: (input: CreateStationInput): Promise<StationResponse> =>
    apiFetch("/api/stations", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateStationInput): Promise<StationResponse> =>
    apiFetch(`/api/stations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (id: string): Promise<MessageResponse> => apiFetch(`/api/stations/${id}`, { method: "DELETE" }),
};

// ─── Prices ───────────────────────────────────────────────────────────────────

export const pricesApi = {
  setPrice: (stationId: string, fuelId: string, input: SetPriceInput): Promise<MessageResponse> =>
    apiFetch(`/api/stations/${stationId}/fuels/${fuelId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  removeFromStation: (stationId: string, fuelId: string): Promise<MessageResponse> =>
    apiFetch(`/api/stations/${stationId}/fuels/${fuelId}`, {
      method: "DELETE",
    }),

  history: (stationId: string, fuelId: string): Promise<PriceHistoryResponse> =>
    apiFetch(`/api/stations/${stationId}/fuels/${fuelId}/history`),
};
