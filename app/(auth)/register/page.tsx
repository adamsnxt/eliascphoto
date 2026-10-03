"use client";

import {
  cancelRegistration,
  registerDashboardUser,
} from "@/src/actions/AuthActions";
import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState, type FormEvent } from "react";
import { IoClose, IoLockClosedOutline, IoPersonOutline } from "react-icons/io5";

export default function DashboardRegisterPage() {
  const [state, registerAction, pending] = useActionState(
    registerDashboardUser,
    { error: null },
  );
  const [credentials, setCredentials] = useState({
    userName: "",
    password: "",
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const requestRegistrationKey = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCredentials({
      userName: String(formData.get("userName") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    setIsKeyModalOpen(true);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-4xl bg-background p-6 shadow-[0_0_18px_0px_rgba(0,0,0,0.16)] sm:p-9"
      >
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase text-foreground/55">
            Administración
          </p>
          <h1 className="mt-2 text-2xl font-bold">Crear usuario</h1>
          <p className="mt-2 text-sm text-foreground/65">
            Completa los datos para crear una cuenta de acceso.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={requestRegistrationKey}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Username
            <span className="relative">
              <IoPersonOutline
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/45"
                size={18}
              />
              <input
                type="text"
                name="userName"
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
                className="h-12 w-full rounded-xl border border-black/15 bg-white/60 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
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
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                className="h-12 w-full rounded-xl border border-black/15 bg-white/60 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          <button
            type="submit"
            className="mt-2 flex h-12 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Continuar
          </button>
        </form>
      </motion.section>

      <AnimatePresence>
        {isKeyModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="register-key-title"
              className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 id="register-key-title" className="text-lg font-bold">
                    Clave de autorización
                  </h2>
                  <p className="mt-1 text-sm text-foreground/65">
                    Confirma la clave para crear el usuario.
                  </p>
                </div>
                <button
                  type="submit"
                  form="cancel-registration"
                  aria-label="Cancelar registro"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
                >
                  <IoClose size={19} />
                </button>
              </div>

              <form id="cancel-registration" action={cancelRegistration} />
              <form action={registerAction} className="flex flex-col gap-4">
                <input
                  type="hidden"
                  name="userName"
                  value={credentials.userName}
                />
                <input
                  type="hidden"
                  name="password"
                  value={credentials.password}
                />
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Clave
                  <input
                    type="password"
                    name="registrationKey"
                    autoComplete="off"
                    required
                    autoFocus
                    className="h-12 w-full rounded-xl border border-black/15 bg-white/60 px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                {state.error && (
                  <p
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800"
                    role="alert"
                  >
                    {state.error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="flex h-11 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {pending ? "Creando usuario..." : "Crear usuario"}
                </button>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
