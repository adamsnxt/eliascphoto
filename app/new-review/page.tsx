"use client";
import { createReview } from "@/src/actions";
import { GlassSurface, GrainLayer, StarsRate } from "@/src/components/atoms";
import { motion } from "framer-motion";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { IoSend } from "react-icons/io5";
import { sileo } from "sileo";
import { ThinkingOrb } from "thinking-orbs";
import { useRouter } from "next/navigation";

export default function NewReview() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createReview, {
    success: false,
    error: null,
  });
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const promiseRef = useRef<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pending && !promiseRef.current) {
      const promise = new Promise((resolve, reject) => {
        promiseRef.current = { resolve, reject };
      });

      sileo.promise(promise, {
        loading: { title: "Enviando reseña..." },
        success: { title: "¡Reseña enviada!" },
        error: (error) => ({
          title:
            error instanceof Error
              ? error.message
              : "No se pudo enviar la reseña.",
        }),
      });
      return;
    }

    if (!pending && promiseRef.current) {
      const notification = promiseRef.current;
      promiseRef.current = null;

      if (state.success) {
        notification.resolve(state);
        redirectTimeoutRef.current = setTimeout(() => {
          router.replace("/");
        }, 2000);
      } else {
        notification.reject(
          new Error(state.error ?? "No se pudo enviar la reseña."),
        );
      }
    }
  }, [pending, router, state]);

  useEffect(
    () => () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    },
    [],
  );

  const handleReviewChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const maxHeight = 192;

    setReviewText(textarea.value);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  return (
    <section className="relative flex h-screen w-full  items-center justify-center overflow-hidden bg-background p-3">
      <div className="relative flex flex-1 max-w-xl flex-col  items-center justify-center overflow-hidden rounded-[2.5rem] bg-flagGradient p-3 shadow-2xl sm:p-8 md:p-12">
        <GrainLayer />
        <motion.div
          className="absolute left-1/2 bottom-1/2 aspect-square w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-[120px]"
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
          className="relative z-50 w-full max-w-xl"
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
            className="my-custom-class w-full! flex! flex-col! h-auto! p-5! text-white sm:p-8!"
          >
            <h1 className="text-2xl font-bold md:text-4xl">Reseñas</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Deja tu reseña y ayúdame a mejorar mi trabajo.
            </p>

            <form
              className="mt-7 flex w-full flex-col gap-5"
              action={formAction}
            >
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-white/90"
                >
                  Usuario de Instagram
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="@tuusuario"
                  autoComplete="username"
                  maxLength={30}
                  required
                  className="h-12 w-full rounded-full border border-white/15 bg-white/10 px-4 text-base text-white outline-none transition placeholder:text-white/45 focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="review"
                  className="text-sm font-medium text-white/90"
                >
                  Tu reseña
                </label>
                <textarea
                  name="review"
                  id="review"
                  value={reviewText}
                  onChange={handleReviewChange}
                  placeholder="Cuéntame cómo fue tu experiencia..."
                  maxLength={1000}
                  required
                  className="min-h-32 max-h-48 w-full resize-none overflow-y-hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-base leading-6 text-white outline-none transition placeholder:text-white/45 focus:border-primary focus:ring-2 focus:ring-primary/30 scrollbar-none"
                />
                <span className="self-end text-xs tabular-nums text-white/50">
                  {reviewText.length}/1000
                </span>
              </div>

              <input type="hidden" name="rating" value={rating} />
              <div className="flex flex-col gap-5 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-white/90">
                    Tu calificación
                  </span>
                  <div className="flex items-center gap-3">
                    <StarsRate rating={rating} setRating={setRating} />
                    <span className="min-w-10 text-sm font-semibold text-amber-300">
                      {rating > 0 ? `${rating}/5` : "Elige"}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={pending || rating === 0}
                  className="flex h-12  items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                >
                  <span>
                    {pending ? (
                      <ThinkingOrb state="searching" size={20} />
                    ) : (
                      <IoSend aria-hidden="true" />
                    )}
                  </span>
                </button>
              </div>
            </form>
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
