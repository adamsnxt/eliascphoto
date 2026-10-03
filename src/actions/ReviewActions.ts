"use server";

import { ReviewConnectionError, ReviewService } from "../service/ReviewService";
import type { ReviewInput } from "../types/Reviews";

function validateReviewInput(review: ReviewInput): string | null {
  if (typeof review.name !== "string" || !review.name.trim()) {
    return "El nombre es obligatorio.";
  }
  if (typeof review.text !== "string" || !review.text.trim()) {
    return "El texto de la reseña es obligatorio.";
  }
  if (
    typeof review.rate !== "number" ||
    !Number.isFinite(review.rate) ||
    review.rate < 0.5 ||
    review.rate > 5
  ) {
    return "La calificación debe estar entre 0.5 y 5.";
  }
  if (typeof review.isActive !== "boolean") {
    return "El estado activo de la reseña no es válido.";
  }
  return null;
}

export async function getDashboardReviews() {
  try {
    return {
      success: true as const,
      reviews: await ReviewService.getReviews(),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      success: false as const,
      reviews: [],
      error:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las reseñas.",
    };
  }
}

export async function updateDashboardReview(id: number, review: ReviewInput) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: "El identificador de la reseña no es válido.",
    };
  }
  const validationError = validateReviewInput(review);
  if (validationError) return { success: false, error: validationError };

  try {
    const updatedReview = await ReviewService.updateReview(id, {
      ...review,
      name: review.name.trim(),
      text: review.text.trim(),
    });
    return { success: true, review: updatedReview, error: null };
  } catch (error) {
    console.error("Error updating dashboard review:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la reseña.",
    };
  }
}

export async function deleteDashboardReview(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      error: "El identificador de la reseña no es válido.",
    };
  }

  try {
    await ReviewService.deleteReview(id);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting dashboard review:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la reseña.",
    };
  }
}

export async function createReview(
  _previousState: { success: boolean; error: string | null },
  reviewData: FormData,
) {
  const name = reviewData.get("name");
  const review = reviewData.get("review");
  try {
    const rating = Number(reviewData.get("rating"));
    if (typeof name !== "string" || !name.trim()) {
      return {
        success: false,
        error: "El usuario de Instagram es obligatorio.",
      };
    }
    if (typeof review !== "string" || !review.trim()) {
      return { success: false, error: "Escribe tu reseña antes de enviarla." };
    }
    if (!Number.isFinite(rating) || rating <= 0 || rating > 5) {
      return { success: false, error: "Selecciona una calificación." };
    }

    await ReviewService.newReview(name.trim(), review.trim(), rating);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo enviar la reseña. Inténtalo de nuevo.",
    };
  }
}
export async function getReviews() {
  try {
    const reviews = await ReviewService.getReviews();
    return {
      success: true as const,
      reviews: reviews.filter((review) => review.isActive),
      retryable: false as const,
    };
  } catch (error) {
    const retryable = error instanceof ReviewConnectionError;
    if (!retryable) console.error("Error fetching reviews:", error);
    return {
      success: false as const,
      reviews: [],
      retryable,
    };
  }
}
