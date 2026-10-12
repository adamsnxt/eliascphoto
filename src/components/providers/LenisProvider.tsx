"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

export default function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const isDashboard =
      pathname.startsWith("/dashboard") ||
      window.location.hostname.startsWith("dash.");

    if (isDashboard) {
      // Bloqueamos solamente el scroll exterior.
      // Los contenedores internos mantienen su overflow-auto.
      const previousOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = "hidden";

      return () => {
        document.documentElement.style.overflow = previousOverflow;
      };
    }

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      anchors: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return children;
}
