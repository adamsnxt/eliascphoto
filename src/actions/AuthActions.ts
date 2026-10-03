"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthService } from "../service/AuthService";

export interface LoginState {
  success: boolean;
  error: string | null;
}

export async function loginDashboard(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const userName = formData.get("userName");
  const password = formData.get("password");

  if (
    typeof userName !== "string" ||
    !userName.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return { success: false, error: "Completa el usuario y la contraseña." };
  }

  try {
    const tokens = await AuthService.login(userName.trim(), password);
    await AuthService.storeTokens(tokens);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "No se pudo iniciar sesión.",
    };
  }

  redirect("/dashboard");
}

export async function logoutDashboard() {
  const refreshToken = (await cookies()).get("refreshToken")?.value;

  try {
    if (refreshToken) await AuthService.logout(refreshToken);
  } catch {
    console.warn("Remote logout failed; clearing the local session anyway.");
  } finally {
    await AuthService.clearTokens();
  }

  redirect("/");
}
