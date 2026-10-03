"use client";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import hero from "./../src/data/Hero.json";
import { StarsRate } from "@/src/components/atoms";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Review } from "@/src/types/Reviews";
import { getReviews } from "@/src/actions";
import Link from "next/link";

export default function Home() {
  const progress = useMotionValue(0);
  const x = useTransform(progress, (value) => `${-50 * value}%`);
  const carouselAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewsHovered, setIsReviewsHovered] = useState(false);

  const getReviewsClient = async () => {
    const reviews = await getReviews();
    return reviews;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviews = await getReviewsClient();
        setReviews(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    carouselAnimation.current = animate(progress, 1, {
      duration: 36,
      ease: "linear",
      repeat: Infinity,
    });

    return () => carouselAnimation.current?.stop();
  }, [progress]);

  useEffect(() => {
    const animation = carouselAnimation.current;
    if (!animation) return;

    if (isReviewsHovered || selectedReview) {
      animation.pause();
    } else {
      animation.play();
    }
  }, [isReviewsHovered, selectedReview]);

  useEffect(() => {
    if (!selectedReview) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedReview(null);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [selectedReview]);

  return (
    <main className="relative flex h-dvh flex-col items-center overflow-hidden">
      {/* <Navbar /> */}
      <Image
        src="/logo/logo.png"
        alt="Logo"
        width={80}
        height={80}
        className=" absolute top-3 sm:top-5 left-3 sm:left-5 z-20"
      />
      <div className="flex w-full min-h-0 flex-1 flex-col items-center gap-3 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5">
        <div className="relative flex min-h-0 w-full max-w-7xl flex-3 flex-col items-center justify-center gap-4 overflow-hidden rounded-4xl bg-flagGradient p-6 shadow-2xl sm:gap-5 sm:rounded-[4rem] sm:p-10 md:p-16 lg:rounded-[8rem] lg:p-24">
          <motion.div
            className="w-full aspect-square absolute top-3/5 left-1/2 -translate-x-1/2 bg-primary rounded-full blur-[100px] z-10"
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

          <div className="text-white text-xs p-2 px-4 bg-red-600 absolute top-5 left-1/2 -translate-x-1/2 rounded-3xl shadow-lg">
            Nuevo
          </div>
          <div className="relative z-10 w-full max-w-3xl px-1">
            <h1 className="text-center text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {hero.title}
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-white sm:text-base">
              {hero.description}{" "}
            </p>
          </div>
          <Link
            href={hero.cta.buy.link}
            className="p-3 px-6 bg-primary rounded-3xl w-fit h-fit cursor-pointer flex justify-center items-center gap-3 text-base shadow-[0_0px_14px_var(--primary)] relative z-20"
          >
            {hero.cta.buy.text} <FaWhatsapp />
          </Link>
          <span className="text-primary inline absolute top-5 right-5 lg:top-5 lg:right-25">
            EN VIVO{" "}
            <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
          </span>
          <p className="text-white absolute bottom-5 left-1/2 -translate-x-1/2 text-xs sm:text-sm z-50 text-center">
            Tambien puedes suscribirte a mi{" "}
            <Link
              href="/newsletter"
              className="text-blue-500 font-bold underline"
            >
              Newsletter
            </Link>
          </p>
        </div>
        <div
          className="w-full min-h-36 max-w-7xl flex-1 overflow-hidden mask-[linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]"
          aria-label="Reseñas de clientes"
          role="region"
          onMouseEnter={() => setIsReviewsHovered(true)}
          onMouseLeave={() => setIsReviewsHovered(false)}
        >
          <motion.div className="flex h-full w-max" style={{ x }}>
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex h-full shrink-0 gap-5 pr-5 py-2"
                aria-hidden={copy === 1}
              >
                {reviews.map((reseña, index) => (
                  <article
                    key={`${copy}-${index}`}
                    role="button"
                    tabIndex={copy === 1 ? -1 : 0}
                    aria-label={`Leer la reseña completa de ${reseña.name}`}
                    onClick={() => setSelectedReview(reseña)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedReview(reseña);
                      }
                    }}
                    className="flex h-full min-h-0 w-[min(82vw,22rem)] shrink-0 cursor-pointer flex-col rounded-2xl bg-background p-4 text-left shadow-md transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-80 sm:p-5"
                  >
                    <p className="shrink-0 text-sm font-semibold sm:text-base">
                      {reseña.name}
                    </p>
                    <p
                      title={reseña.text}
                      className="mt-2 min-h-0 flex-1 overflow-hidden whitespace-normal wrap-break-word text-xs leading-relaxed sm:text-sm"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {reseña.text}
                    </p>
                    <div className="mt-3 flex h-5 shrink-0 items-center">
                      <StarsRate rating={reseña.rate} />
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReview(null)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-dialog-title"
              className="my-auto w-full max-w-xl rounded-3xl border border-white/15 bg-background p-6 text-foreground shadow-2xl sm:p-8"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-foreground/60">
                    Reseña completa
                  </p>
                  <h2
                    id="review-dialog-title"
                    className="mt-1 wrap-break-word text-xl font-bold sm:text-2xl"
                  >
                    {selectedReview.name}
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Cerrar reseña"
                  title="Cerrar"
                  onClick={() => setSelectedReview(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/10 transition hover:bg-foreground/20 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <IoClose aria-hidden="true" size={20} />
                </button>
              </div>
              <p className="mt-6 max-h-[55dvh] overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm leading-7 sm:text-base">
                {selectedReview.text}
              </p>
              <div className="mt-6 border-t border-foreground/10 pt-4">
                <StarsRate rating={selectedReview.rate} />
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
