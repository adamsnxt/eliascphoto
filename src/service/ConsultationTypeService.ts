import "server-only";

import { AuthService } from "./AuthService";
import type {
  ConsultationType,
  ConsultationTypeInput,
} from "../types/ConsultationTypes";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await AuthService.requestProtected(
    `/api/consultation-types${path}`,
    { ...options, headers },
  );

  if (response.status === 204) return undefined as T;

  const responseText = await response.text();
  let payload: unknown = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown;
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    const body =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    const backendMessage = [body?.message, body?.detail, body?.error].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
    const message =
      backendMessage ??
      (typeof payload === "string"
        ? payload
        : payload === null
          ? response.statusText || `HTTP ${response.status}`
          : JSON.stringify(payload));
    throw new Error(message);
  }

  return payload as T;
}

export const ConsultationTypeService = {
  getManageList: async (): Promise<ConsultationType[]> => {
    const result = await request<unknown>("/manage", { method: "GET" });
    if (!Array.isArray(result)) {
      throw new Error("El backend devolvió una lista de asesorías inválida.");
    }
    return result as ConsultationType[];
  },
  create: (consultationType: ConsultationTypeInput) =>
    request<ConsultationType>("", {
      method: "POST",
      body: JSON.stringify(consultationType),
    }),
  update: (id: number, consultationType: ConsultationTypeInput) =>
    request<ConsultationType>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(consultationType),
    }),
  deactivate: (id: number) => request<void>(`/${id}`, { method: "DELETE" }),
};
