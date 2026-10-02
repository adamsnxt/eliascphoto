"use server";

import { ReviewService } from "@/src/service/ReviewService";

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
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}
