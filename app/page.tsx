"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen relative">
      <div className="w-full h-screen overflow-hidden flex flex-col justify-center items-center relative">
        <motion.div
          className="w-full aspect-square absolute top-3/5 left-1/2 -translate-x-1/2 bg-primary rounded-full blur-[100px]"
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 8,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
        <h1 className="text-5xl font-bold relative z-10">Eliascphoto Web </h1>
      </div>
    </main>
  );
}
