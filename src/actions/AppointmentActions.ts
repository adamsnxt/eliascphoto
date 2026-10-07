"use server";

import { AppointmentService } from "../service/AppointmentService";
import type {
  CreateAppointmentInput,
  RescheduleAppointmentInput,
} from "../types/Appointments";

function validateSchedule(date: string, startTime: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Selecciona una fecha válida.";
  }

  const [year, month, day] = date.split("-").map(Number);

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return "Selecciona una fecha válida.";
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    return "Selecciona una hora válida.";
  }

  return null;
}

function validateAppointment(input: CreateAppointmentInput): string | null {
  if (
    typeof input.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    return "Ingresa un email válido.";
  }
  if (typeof input.instagram !== "string" || !input.instagram.trim()) {
    return "El usuario de Instagram es obligatorio.";
  }
  if (
    !Number.isInteger(input.consultationTypeId) ||
    input.consultationTypeId <= 0
  ) {
    return "Selecciona un tipo de asesoría.";
  }
  return validateSchedule(input.date, input.startTime);
}

function validateId(id: number): string | null {
  return Number.isInteger(id) && id > 0
    ? null
    : "El identificador del turno no es válido.";
}

export async function getAppointments() {
  try {
    return {
      success: true as const,
      appointments: await AppointmentService.getAll(),
      error: null,
    };
  } catch (error) {
    return {
      success: false as const,
      appointments: [],
      error:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los turnos.",
    };
  }
}

export async function createAppointment(input: CreateAppointmentInput) {
  const validationError = validateAppointment(input);
  console.log("recibi : " + JSON.stringify(input));

  if (validationError) return { success: false, error: validationError };

  try {
    const appointment = await AppointmentService.create({
      ...input,
      email: input.email.trim(),
      instagram: input.instagram.trim(),
    });
    console.log("Y AQUI:" + appointment);

    return { success: true, appointment, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "No se pudo crear el turno.",
    };
  }
}

export async function rescheduleAppointment(
  id: number,
  schedule: RescheduleAppointmentInput,
) {
  const idError = validateId(id);
  if (idError) return { success: false, error: idError };
  const scheduleError = validateSchedule(schedule.date, schedule.startTime);
  if (scheduleError) return { success: false, error: scheduleError };

  try {
    const appointment = await AppointmentService.reschedule(id, schedule);
    return { success: true, appointment, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo reprogramar el turno.",
    };
  }
}

export async function markAppointmentPaid(id: number) {
  const idError = validateId(id);
  if (idError) return { success: false, error: idError };

  try {
    const appointment = await AppointmentService.markPaid(id);
    return { success: true, appointment, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo confirmar el pago.",
    };
  }
}

export async function cancelAppointment(id: number) {
  const idError = validateId(id);
  if (idError) return { success: false, error: idError };

  try {
    await AppointmentService.cancel(id);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el turno.",
    };
  }
}
