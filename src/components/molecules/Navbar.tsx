"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
const ROUTES = [
  {
    label: "Herramientas",
    path: "/tools",
  },
];

const Navbar = () => {
  const [progress, setProgress] = useState(0);
  const path = usePathname();

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;

      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const percentage =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    updateProgress();

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [path]);
  return (
    <nav className="sticky top-0 left-0 flex justify-center items-center w-full h-24 pt-5 z-50 px-3">
      <motion.div
        className="fixed top-0 left-0 z-100 h-px bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      />
      <div className="max-w-3xl flex justify-between px-3 sm:px-5 py-2 sm:p-3 items-center dark:shadow-[0_0_10px_rgba(0,0,0,0.8)] shadow-[0_0_10px_rgba(0,0,0,0.3)] rounded-3xl w-full sm:h-20 h-16 bg-background relative z-50">
        <div className="absolute top-3 bottom-3 left-3 ">
          <AnimatePresence mode="wait">
            {path !== "/" ? (
              <motion.div
                key="back"
                initial={{ opacity: 0, scale: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex shrink-0 justify-center items-center h-full"
              >
                <Link
                  href="/"
                  className="p-2 px-4 rounded-full bg-background dark:shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.8)] 
                  shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.3)] flex gap-2 justify-center items-center "
                >
                  <IoIosArrowBack />
                  volver
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex shrink-0 justify-center items-center h-full aspect-square"
              >
                <Image
                  src="/logo/logoLigth.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="h-full w-auto object-contain hidden dark:block"
                />
                <Image
                  src="/logo/logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="h-full w-auto object-contain dark:hidden"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="w-full text-base md:text-xl flex gap-2 justify-center items-center ">
          {ROUTES.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="p-2 px-4  rounded-2xl"
            >
              {route.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
