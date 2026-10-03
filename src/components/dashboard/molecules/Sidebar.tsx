"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { logoutDashboard } from "@/src/actions/AuthActions";

const ROUTES = [
  { href: "/newsletter", label: "Newsletter" },
  { href: "/reviews", label: "Reseñas" },
  { href: "/profile", label: "Trunos" },
];
export const Sidebar = () => {
  const pathname = usePathname();
  const canGoBack = pathname !== "/" && pathname !== "/dashboard";

  useEffect(() => {
    console.log("Current pathname:", pathname);
  }, [pathname]);
  return (
    <nav className="w-96 p-4">
      <div className="w-full h-full bg-background shadow-[0_0_10px_0px_rgba(0,0,0,0.3)] rounded-4xl p-4 flex flex-col gap-4">
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

        <div className="flex-1 overflow-y-auto p-4 border-t border-gray-300">
          <ul>
            {ROUTES.map((route) => (
              <li key={route.href} className="mb-2">
                <Link href={route.href} className="text-lg hover:underline">
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
    </nav>
  );
};
