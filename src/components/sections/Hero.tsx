"use client";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import hero from "./../../data/Hero.json";
import { StarsRate } from "@/src/components/atoms";
import { useEffect, useRef, useState } from "react";
import { Review } from "@/src/types/Reviews";
import { getReviews } from "@/src/actions";
import Link from "next/link";
import Image from "next/image";
import Glow from "@/src/components/atoms/Glow";
import RenderAccentText from "@/src/utils/RenderAccentText";

export const Hero = () => {
  const progress = useMotionValue(0);
  const x = useTransform(progress, (value) => `${-50 * value}%`);
  const carouselAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewsHovered, setIsReviewsHovered] = useState(false);
  const [mouseEnter, setMouseEnter] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleRetry = () => {
      if (!isMounted) return;
      retryTimeout = setTimeout(() => void fetchReviews(), 3000);
    };

    const fetchReviews = async () => {
      try {
        const result = await getReviews();
        if (!isMounted) return;

        if (result.success) {
          setReviews(
            result.reviews.filter((review) => review.isActive === true),
          );
        } else if (result.retryable) {
          scheduleRetry();
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        scheduleRetry();
      }
    };

    void fetchReviews();
    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
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
    <>
      <section className="relative flex flex-col items-center overflow-hidden h-[calc(100dvh-6rem)] w-full">
        <div className="flex w-full flex-1 flex-col items-center gap-3 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 ">
          <div
            className="relative flex min-h-0 w-full max-w-7xl flex-3 flex-col xl:items-end items-center justify-center gap-4 rounded-4xl bg-flagGradient p-6 shadow-2xl sm:gap-5 sm:rounded-[4rem] sm:p-10 md:p-16 lg:rounded-[8rem] lg:p-24  group text-white"
            onMouseEnter={() => setMouseEnter(true)}
            onMouseLeave={() => setMouseEnter(false)}
          >
            <div className="w-full h-full overflow-hidden absolute bottom-0 left-0 rounded-4xl sm:rounded-[4rem] lg:rounded-[8rem] z-10">
              <Glow enter={mouseEnter} />
            </div>

            <div className=" flex flex-col gap-4 xl:justify-start justify-center items-center xl:items-start">
              <div className="relative z-10 w-full max-w-3xl px-1">
                <h1 className="text-center xl:text-left text-3xl font-bold  sm:text-4xl md:text-5xl">
                  {hero.title}
                </h1>
                <p className="whitespace-pre-line max-w-150 text-center xl:text-left">
                  <RenderAccentText text={hero.description} />
                </p>
              </div>
              <Link
                href={hero.cta.buy.link}
                className="p-3 px-6 bg-primary rounded-3xl w-fit h-fit cursor-pointer flex justify-center items-center gap-3 text-base shadow-[0_0px_14px_var(--primary)] relative z-20"
              >
                {hero.cta.buy.text} <FaWhatsapp />
              </Link>
            </div>
            <span className="text-primary inline absolute top-5 right-5 lg:top-5 lg:right-25">
              EN VIVO{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
            </span>
            <p className="text-white absolute bottom-5 left-1/2 -translate-x-1/2 text-xs sm:text-sm z-20 text-center">
              Tambien puedes suscribirte a mi{" "}
              <Link
                href="/newsletter"
                className="text-blue-500 font-bold underline"
              >
                Newsletter
              </Link>
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="w-full h-full absolute top-0 left-0"
            >
              <Image
                src={"/yo.png"}
                width={3000}
                height={3000}
                alt=""
                priority
                className="absolute bottom-0 max-w-179 left-0 z-20 grayscale-10 select-none pointer-events-none xl:block hidden"
              />
            </motion.div>
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
                    <motion.article
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: Math.min(index * 0.05 + copy * 0.08, 0.4),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex h-full min-h-0 w-[min(82vw,22rem)] shrink-0 cursor-pointer flex-col rounded-2xl p-4 text-left dark:shadow-[0_0_10px_rgba(0,0,0,0.8)] shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-80 sm:p-5"
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
                    </motion.article>
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
      </section>
      <Link
        href="/new-review"
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-black/10 px-5 py-3 text-sm font-semibold  text-foreground shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-black/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-background sm:bg-foreground sm:backdrop-blur-none sm:hover:bg-neutral-900"
      >
        <FaStar className="text-amber-400" aria-hidden="true" />
        <span>Dejar reseña</span>
      </Link>
    </>
  );
};
