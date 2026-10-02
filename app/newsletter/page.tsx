"use client";

import { AddBrevoContact } from "@/src/actions";
import { GlassSurface, GrainLayer } from "@/src/components/atoms";
import { motion } from "framer-motion";
import { useActionState, useEffect, useRef } from "react";
import { IoCheckmark, IoSend } from "react-icons/io5";
import { sileo } from "sileo";

const POINTS = ["Consejos", "Regalos", "Promociones", "Plugins", "y mas ..."];

export default function NewsletterPage() {
  const [state, formAction, pending] = useActionState(AddBrevoContact, {
    success: false,
    error: null,
  });

  const promiseRef = useRef<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);

  useEffect(() => {
    if (pending && !promiseRef.current) {
      const promise = new Promise((resolve, reject) => {
        promiseRef.current = {
          resolve,
          reject,
        };
      });

      sileo.promise(promise, {
        loading: {
          title: "Enviando...",
        },

        success: {
          title: "¡Suscripción exitosa!",
        },

        error: (error) => ({
          title:
            error instanceof Error ? error.message : "No se pudo suscribir",
        }),
      });

      return;
    }

    if (!pending && promiseRef.current) {
      const { resolve, reject } = promiseRef.current;

      promiseRef.current = null;

      if (state.success) {
        resolve(state);
        return;
      }

      if (state.error) {
        reject(new Error(state.error));
      }
    }
  }, [pending, state]);

  return (
    <section className="flex flex-col justify-center items-center p-3 overflow-hidden relative h-full w-full bg-background md:p-10">
      {/* Glow */}
      <div className="p-52 shadow-2xl rounded-[8rem] overflow-hidden relative bg-flagGradient flex flex-col justify-center items-center scale-98 hover:scale-100 transition-all duration-500 text-white">
        <GrainLayer />
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
        {/* Card */}
        <motion.div
          className="w-full max-w-96 relative z-50"
          initial={{
            opacity: 0,
            y: 90,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 10,
            mass: 0.8,
          }}
        >
          <GlassSurface
            borderRadius={50}
            className="my-custom-class w-full! flex! flex-col! h-auto! p-5"
          >
            <h1 className="font-bold text-2xl md:text-4xl">Newsletter</h1>

            <p>
              Suscribete a la newsletter de Eliascphoto para recibir mails cada
              semana con:
            </p>

            <ul>
              {POINTS.map((p, i) => (
                <li key={i} className="flex gap-2 justify-start items-center">
                  <IoCheckmark className="text-primary" />
                  {p}
                </li>
              ))}
            </ul>

            <form className="w-full flex gap-2 h-12" action={formAction}>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="example@gmail.com"
                required
                className="flex p-3 px-5 rounded-full border-none outline-0 bg-background/20 backdrop-blur flex-1"
              />

              <button
                type="submit"
                disabled={pending}
                className="aspect-square h-full p-2 rounded-full bg-primary flex justify-center items-center shadow-inner cursor-pointer hover:scale-102 transition-all duration-300 disabled:opacity-50"
              >
                <IoSend />
              </button>
            </form>
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
