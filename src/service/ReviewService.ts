import { Review } from "../types/Reviews";

export const ReviewService = {
  newReview: async (name: string, text: string, rate: number) => {
    const requestBody: { name: string; text: string; rate: number } = {
      name,
      text,
      rate,
    };

    let response: Response;
    try {
      response = await fetch(`${process.env.API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch {
      throw new Error(
        "No se pudo conectar con el servidor. Inténtalo de nuevo.",
      );
    }

    const payload: unknown = await response.json().catch(() => null);
    const body =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    const backendError = [body?.error, body?.message, body?.detail].find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );

    if (!response.ok || body?.success === false) {
      throw new Error(backendError ?? "No se pudo guardar la reseña.");
    }

    return payload;
  },
  getReviews: async (): Promise<Review[]> => {
    const response = await fetch(`${process.env.API_URL}/api/reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.json);

    return response.json();
  },
};
