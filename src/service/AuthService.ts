import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  tokenType: "Bearer";
}

export class AuthApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

const refreshRequests = new Map<string, Promise<AuthTokens>>();

async function requestTokenPair(
  endpoint: "login" | "refresh",
  body: Record<string, string>,
): Promise<AuthTokens> {
  let response: Response;
  try {
    response = await fetch(`${process.env.API_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("No se pudo conectar con el servicio de autenticación.");
  }

  const payload: unknown = await response.json().catch(() => null);
  const result =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;

  if (!response.ok) {
    const message = [result?.message, result?.detail, result?.error].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
    throw new AuthApiError(
      response.status,
      response.status === 401 && endpoint === "login"
        ? "Usuario o contraseña incorrectos."
        : (message ??
            (endpoint === "refresh"
              ? "La sesión expiró. Inicia sesión de nuevo."
              : "No se pudo iniciar sesión.")),
    );
  }

  const accessToken = result?.accessToken;
  const refreshToken = result?.refreshToken;
  const accessTokenExpiresIn = result?.accessTokenExpiresIn;
  const refreshTokenExpiresIn = result?.refreshTokenExpiresIn;
  if (
    typeof accessToken !== "string" ||
    !accessToken ||
    typeof refreshToken !== "string" ||
    !refreshToken ||
    typeof accessTokenExpiresIn !== "number" ||
    accessTokenExpiresIn <= 0 ||
    typeof refreshTokenExpiresIn !== "number" ||
    refreshTokenExpiresIn <= 0 ||
    result?.tokenType !== "Bearer"
  ) {
    throw new Error("El servicio de autenticación devolvió tokens inválidos.");
  }

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
    tokenType: "Bearer",
  };
}

function refreshOnce(refreshToken: string): Promise<AuthTokens> {
  const pending = refreshRequests.get(refreshToken);
  if (pending) return pending;

  const refreshRequest = requestTokenPair("refresh", { refreshToken });
  refreshRequests.set(refreshToken, refreshRequest);
  void refreshRequest.then(
    () => {
      if (refreshRequests.get(refreshToken) === refreshRequest) {
        refreshRequests.delete(refreshToken);
      }
    },
    () => {
      if (refreshRequests.get(refreshToken) === refreshRequest) {
        refreshRequests.delete(refreshToken);
      }
    },
  );
  return refreshRequest;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

async function storeTokens(tokens: AuthTokens) {
  const cookieStore = await cookies();
  cookieStore.set(
    "accessToken",
    tokens.accessToken,
    cookieOptions(tokens.accessTokenExpiresIn),
  );
  cookieStore.set(
    "refreshToken",
    tokens.refreshToken,
    cookieOptions(tokens.refreshTokenExpiresIn),
  );
  cookieStore.set(
    "accessTokenExpiresAt",
    String(Date.now() + tokens.accessTokenExpiresIn * 1000),
    cookieOptions(tokens.accessTokenExpiresIn),
  );
}

async function clearTokens() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("accessTokenExpiresAt");
}

async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  try {
    const tokens = await refreshOnce(refreshToken);
    await storeTokens(tokens);
    return tokens;
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401) {
      await clearTokens();
      redirect("/");
    }
    throw error;
  }
}

export const AuthService = {
  login: (userName: string, password: string) =>
    requestTokenPair("login", { userName, password }),
  refresh: (refreshToken: string) =>
    requestTokenPair("refresh", { refreshToken }),
  logout: async (refreshToken: string): Promise<void> => {
    let response: Response;
    try {
      response = await fetch(`${process.env.API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      throw new Error("No se pudo conectar con el servicio de logout.");
    }

    if (!response.ok) {
      throw new AuthApiError(
        response.status,
        "No se pudo cerrar la sesión remota.",
      );
    }
  },
  register: async (userName: string, password: string): Promise<void> => {
    let response: Response;
    try {
      response = await fetch(`${process.env.API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
        cache: "no-store",
      });
    } catch {
      throw new Error("No se pudo conectar con el servicio de registro.");
    }

    if (response.ok) return;

    const responseText = await response.text();
    let payload: unknown = null;
    if (responseText) {
      try {
        payload = JSON.parse(responseText) as unknown;
      } catch {
        payload = responseText;
      }
    }
    const body =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    const message = [body?.message, body?.detail, body?.error].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
    const backendResponse =
      typeof payload === "string"
        ? payload
        : payload === null
          ? response.statusText || `HTTP ${response.status}`
          : JSON.stringify(payload);
    throw new AuthApiError(response.status, message ?? backendResponse);
  },
  storeTokens,
  clearTokens,
  requestProtected: async (path: string, options: RequestInit = {}) => {
    if (
      path.startsWith("/api/auth/login") ||
      path.startsWith("/api/auth/refresh")
    ) {
      throw new Error("Usa los métodos de autenticación dedicados.");
    }

    const cookieStore = await cookies();
    let accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const expiresAt = Number(
      cookieStore.get("accessTokenExpiresAt")?.value ?? 0,
    );
    const expiresSoon = expiresAt > 0 && expiresAt <= Date.now() + 30_000;

    if (!accessToken || expiresSoon) {
      if (!refreshToken) {
        await clearTokens();
        redirect("/");
      }
      const tokens = await refreshSession(refreshToken);
      accessToken = tokens.accessToken;
    }

    const sendRequest = (token: string) => {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${token}`);
      return fetch(`${process.env.API_URL}${path}`, {
        ...options,
        headers,
        cache: "no-store",
      });
    };

    let response: Response;
    try {
      response = await sendRequest(accessToken);
    } catch {
      throw new Error("No se pudo conectar con el servicio.");
    }

    if (response.status !== 401) return response;
    if (!refreshToken) {
      await clearTokens();
      redirect("/");
    }

    const tokens = await refreshSession(refreshToken);
    try {
      response = await sendRequest(tokens.accessToken);
    } catch {
      throw new Error("No se pudo conectar con el servicio.");
    }

    if (response.status === 401) {
      await clearTokens();
      redirect("/");
    }
    return response;
  },
};
