"use client";

import Image from "next/image";
import { useActionState } from "react";
import { IoLockClosedOutline, IoMailOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import {
  loginDashboard,
  openRegistrationPage,
} from "@/src/actions/AuthActions";

export default function DashboardLoginPage() {
  const [state, formAction, pending] = useActionState(loginDashboard, {
    success: false,
    error: null,
  });
  const [registrationState, registrationAction] = useActionState(
    openRegistrationPage,
    { error: null },
  );

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-4xl bg-background p-6 shadow-[0_0_18px_0px_rgba(0,0,0,0.16)] sm:p-9"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo/logo.png"
            alt="ELIASCPHOTO"
            width={56}
            height={56}
            priority
          />
          <h1 className="mt-5 text-2xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-foreground/65">
            Accede al panel de administración.
          </p>
        </div>

        <form className="flex flex-col gap-5" action={formAction}>
          <label className="flex flex-col gap-2 font-medium">
            Usuario
            <span className="relative">
              <IoMailOutline
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/45"
                size={18}
              />
              <input
                type="text"
                name="userName"
                autoComplete="username"
                required
                maxLength={100}
                className="h-12 w-full rounded-xl border border-black/15 bg-white/60 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2 font-medium">
            Contraseña
            <span className="relative">
              <IoLockClosedOutline
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/45"
                size={18}
              />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-xl border border-black/15 bg-white/60 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          {state.error && (
            <p
              className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 flex h-12 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {pending ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>
      </motion.section>
      {registrationState.error && (
        <p
          className="fixed bottom-16 right-4 z-50 max-w-[min(24rem,calc(100vw-2rem))] rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800 shadow-lg"
          role="alert"
        >
          {registrationState.error}
        </p>
      )}
      <form action={registrationAction} className="fixed bottom-0 right-0 z-50">
        <button
          type="submit"
          aria-label="Acceso alternativo"
          className="h-12 w-12 cursor-pointer opacity-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary"
        />
      </form>
    </main>
  );
}
