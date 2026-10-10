"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

const Glow = ({ enter }: { enter: boolean | null }) => {
  const controls = useAnimationControls();

  const [interactionReady, setInteractionReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setInteractionReady(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Animación de entrada inicial
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 2,
        delay: 1.5,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [controls]);

  // Hover controlado por el padre
  useEffect(() => {
    if (!interactionReady || enter === null) return;

    controls.start({
      opacity: enter ? 0.8 : 1,
      scale: enter ? 1.3 : 1,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [enter, controls]);

  return (
    <motion.div
      className="w-full aspect-square absolute top-3/5 left-1/2 -translate-x-1/2 bg-primary rounded-full blur-[100px] z-10"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={controls}
    />
  );
};

export default Glow;
