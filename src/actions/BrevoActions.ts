"use server";

import { Brevo } from "../service/Brevo";

export async function AddBrevoContact(_prevState: unknown, formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    return {
      success: false,
      error: "Email requerido",
    };
  }

  try {
    await Brevo.addContact(email.trim());

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "No se pudo suscribir",
    };
  }
}
