"use server";

import { ConsultationTypeService } from "../service/ConsultationTypeService";
import type { ConsultationTypeInput } from "../types/ConsultationTypes";

function validateInput(input: ConsultationTypeInput): string | null {
  if (typeof input.name !== "string" || !input.name.trim()) {
    return "El nombre es obligatorio.";
  }
  if (
    typeof input.priceUsd !== "number" ||
    !Number.isFinite(input.priceUsd) ||
    input.priceUsd < 0
  ) {
    return "El precio debe ser un número igual o mayor que cero.";
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1) {
    return "La duración debe ser de al menos un minuto.";
  }
  if (typeof input.active !== "boolean") {
    return "El estado del tipo de asesoría no es válido.";
  }
  return null;
}

export async function getManagedConsultationTypes() {
  try {
    return {
      success: true as const,
      consultationTypes: await ConsultationTypeService.getManageList(),
      error: null,
    };
  } catch (error) {
    return {
      success: false as const,
      consultationTypes: [],
      error:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los tipos de asesoría.",
    };
  }
}

export async function createConsultationType(input: ConsultationTypeInput) {
  const validationError = validateInput(input);
  if (validationError) return { success: false, error: validationError };

  try {
    const consultationType = await ConsultationTypeService.create({
      ...input,
      name: input.name.trim(),
    });
    return { success: true, consultationType, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo crear el tipo de asesoría.",
    };
  }
}

export async function updateConsultationType(
  id: number,
  input: ConsultationTypeInput,
) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: "El id del tipo de asesoría no es válido.",
    };
  }
  const validationError = validateInput(input);
  if (validationError) return { success: false, error: validationError };

  try {
    const consultationType = await ConsultationTypeService.update(id, {
      ...input,
      name: input.name.trim(),
    });
    return { success: true, consultationType, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el tipo de asesoría.",
    };
  }
}

export async function deactivateConsultationType(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: "El id del tipo de asesoría no es válido.",
    };
  }

  try {
    await ConsultationTypeService.deactivate(id);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo desactivar el tipo de asesoría.",
    };
  }
}
