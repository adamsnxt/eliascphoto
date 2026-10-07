import "server-only";

import { AuthService } from "./AuthService";
import type {
  Appointment,
  CreateAppointmentInput,
  RescheduleAppointmentInput,
} from "../types/Appointments";

async function readResponse<T>(response: Response): Promise<T> {
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

export const AppointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await AuthService.requestProtected("/api/appointments", {
      method: "GET",
    });
    const appointments = await readResponse<unknown>(response);
    if (!Array.isArray(appointments)) {
      throw new Error("El backend devolvió una lista de turnos inválida.");
    }
    return appointments as Appointment[];
  },

  create: async (appointment: CreateAppointmentInput): Promise<Appointment> => {
    let response: Response;
    try {
      response = await fetch(`${process.env.API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
        cache: "no-store",
      });
    } catch {
      throw new Error("No se pudo conectar con el servicio de turnos.");
    }
    return readResponse<Appointment>(response);
  },

  reschedule: async (
    id: number,
    schedule: RescheduleAppointmentInput,
  ): Promise<Appointment> => {
    const response = await AuthService.requestProtected(
      `/api/appointments/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(schedule),
        headers: { "Content-Type": "application/json" },
      },
    );
    return readResponse<Appointment>(response);
  },

  markPaid: async (id: number): Promise<Appointment> => {
    const response = await AuthService.requestProtected(
      `/api/appointments/${id}/payment-status`,
      {
        method: "PUT",
        body: JSON.stringify({ status: "PAID" }),
        headers: { "Content-Type": "application/json" },
      },
    );
    return readResponse<Appointment>(response);
  },

  cancel: async (id: number): Promise<void> => {
    const response = await AuthService.requestProtected(
      `/api/appointments/${id}`,
      { method: "DELETE" },
    );
    await readResponse<void>(response);
  },
};
