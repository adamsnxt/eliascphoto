import "server-only";

import type { Review, ReviewInput } from "../types/Reviews";

export class ReviewConnectionError extends Error {
  constructor() {
    super("No se pudo conectar con el servidor de reseñas.");
    this.name = "ReviewConnectionError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.API_URL}/api/reviews${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ReviewConnectionError();
  }

  const payload: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  const backendError = [body?.error, body?.message, body?.detail].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  if (!response.ok || body?.success === false) {
    throw new Error(backendError ?? "La operación de reseñas no se completó.");
  }

  return payload as T;
}

export const ReviewService = {
  newReview: (name: string, text: string, rate: number) =>
    request<Review>("", {
      method: "POST",
      body: JSON.stringify({ name, text, rate, isActive: true }),
    }),
  getReviews: async (): Promise<Review[]> => {
    const reviews = await request<unknown>("", { method: "GET" });
    if (!Array.isArray(reviews)) {
      throw new Error("El servidor devolvió una lista de reseñas inválida.");
    }
    return reviews as Review[];
  },
  updateReview: (id: number, review: ReviewInput) =>
    request<Review>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(review),
    }),
  deleteReview: (id: number) => request<void>(`/${id}`, { method: "DELETE" }),
};
