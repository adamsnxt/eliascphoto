"use server";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthService } from "../service/AuthService";

const REGISTER_GATE_COOKIE = "registerGate";
const REGISTER_GATE_TTL_SECONDS = 300;

function getRegisterGateSignature(expiresAt: string, key: string) {
  return createHmac("sha256", key).update(expiresAt).digest("hex");
}

async function clearRegisterGate() {
  const cookieStore = await cookies();
  cookieStore.set(REGISTER_GATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/register",
    maxAge: 0,
  });
}

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

export interface RegisterEntryState {
  error: string | null;
}

export async function openRegistrationPage(
  _previousState: RegisterEntryState,
  _formData: FormData,
): Promise<RegisterEntryState> {
  void _previousState;
  void _formData;

  const key = process.env.REGISTER_ACCESS_KEY;
  if (!key) {
    return {
      error: "Registro deshabilitado: configura REGISTER_ACCESS_KEY en .env.",
    };
  }

  const expiresAt = String(Date.now() + REGISTER_GATE_TTL_SECONDS * 1000);
  const signature = getRegisterGateSignature(expiresAt, key);
  const cookieStore = await cookies();
  cookieStore.set(REGISTER_GATE_COOKIE, `${expiresAt}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/register",
    maxAge: REGISTER_GATE_TTL_SECONDS,
  });

  redirect("/register");
}

export async function cancelRegistration() {
  await clearRegisterGate();
  redirect("/");
}

export interface RegisterState {
  error: string | null;
}

export async function registerDashboardUser(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const userName = formData.get("userName");
  const password = formData.get("password");
  const registrationKey = formData.get("registrationKey");
  const expectedKey = process.env.REGISTER_ACCESS_KEY;

  if (!expectedKey || registrationKey !== expectedKey) {
    await clearRegisterGate();
    redirect("/");
  }

  if (
    typeof userName !== "string" ||
    !userName.trim() ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return {
      error:
        "Ingresa un username y una contraseña válida (mínimo 8 caracteres).",
    };
  }

  try {
    await AuthService.register(userName.trim(), password);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo crear el usuario.",
    };
  }

  await clearRegisterGate();
  redirect("/");
}
