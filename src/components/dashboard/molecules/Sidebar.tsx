"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoLogOutOutline, IoMenuOutline } from "react-icons/io5";
import { logoutDashboard } from "@/src/actions/AuthActions";

const ROUTES = [
  { href: "/newsletter", label: "Newsletter" },
  { href: "/reviews", label: "Reseñas" },
  { href: "/profile", label: "Trunos" },
];
export const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const canGoBack = pathname !== "/" && pathname !== "/dashboard";

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const sidebarPanel = (
    <div className="flex h-full w-full flex-col gap-4 rounded-4xl bg-background p-4 shadow-[0_0_10px_0px_rgba(0,0,0,0.3)]">
      <div className="flex w-full items-center gap-3">
        <AnimatePresence initial={false}>
          {canGoBack && (
            <motion.div
              layout
              initial={{ opacity: 0, x: -16, scale: 0.8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <Link
                href="/dashboard"
                aria-label="Volver al panel"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <IoIosArrowBack />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.h2
          layout
          transition={{
            layout: { type: "spring", stiffness: 420, damping: 32 },
          }}
          className="font-bold text-4xl"
        >
          Menu
        </motion.h2>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-gray-300 p-4">
        <ul>
          {ROUTES.map((route) => (
            <li key={route.href} className="mb-2">
              <Link
                href={route.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-2 py-2 text-lg hover:bg-black/5"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between border-t border-gray-300 pt-3">
        <span className="text-sm text-foreground/65">Panel de control</span>
        <form action={logoutDashboard}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <IoLogOutOutline size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <nav
        className="hidden h-dvh w-96 shrink-0 p-4 md:block"
        aria-label="Menú principal"
      >
        {sidebarPanel}
      </nav>

      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-background shadow-md focus-visible:outline-2 focus-visible:outline-primary md:hidden"
      >
        <IoMenuOutline size={23} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar menú"
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              aria-label="Menú principal"
              className="fixed inset-y-0 left-0 z-50 flex w-[min(80vw,20rem)] max-w-80 flex-col p-3 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
            >
              <div className="min-h-0 flex-1">{sidebarPanel}</div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
