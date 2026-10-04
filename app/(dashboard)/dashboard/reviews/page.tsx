"use client";

import {
  deleteDashboardReview,
  getDashboardReviews,
  updateDashboardReview,
} from "@/src/actions/ReviewActions";
import type { Review, ReviewInput } from "@/src/types/Reviews";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import {
  IoClose,
  IoCreateOutline,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { ThinkingOrb } from "thinking-orbs";

export default function ReviewsDashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Review | null>(null);
  const [form, setForm] = useState<ReviewInput>({
    name: "",
    text: "",
    rate: 5,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [pendingReviewId, setPendingReviewId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      const result = await getDashboardReviews();
      if (!isMounted) return;

      if (result.success) {
        setReviews(result.reviews);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };

    void loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const openEditDialog = (review: Review) => {
    setError(null);
    setForm({
      name: review.name,
      text: review.text,
      rate: review.rate,
      isActive: review.isActive,
    });
    setDialog(review);
  };

  const saveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedReview = dialog;
    if (!selectedReview) return;

    setIsSaving(true);
    setError(null);
    try {
      const result = await updateDashboardReview(selectedReview.id, form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      const updatedReview = "review" in result ? result.review : null;
      setReviews((current) =>
        current.map((review) =>
          review.id === selectedReview.id
            ? (updatedReview ?? { ...review, ...form })
            : review,
        ),
      );
      setDialog(null);
    } catch {
      setError("No se pudo guardar la reseña. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReviewActive = async (review: Review) => {
    const isActive = !review.isActive;
    setPendingReviewId(review.id);
    setError(null);

    try {
      const result = await updateDashboardReview(review.id, {
        name: review.name,
        text: review.text,
        rate: review.rate,
        isActive,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setReviews((current) =>
        current.map((item) =>
          item.id === review.id
            ? { ...item, ...(result.review ?? {}), isActive }
            : item,
        ),
      );
    } catch {
      setError("No se pudo cambiar el estado de la reseña.");
    } finally {
      setPendingReviewId(null);
    }
  };

  const removeReview = async (review: Review) => {
    if (!window.confirm(`¿Eliminar la reseña de ${review.name}?`)) return;

    setPendingReviewId(review.id);
    setError(null);
    try {
      const result = await deleteDashboardReview(review.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setReviews((current) => current.filter((item) => item.id !== review.id));
    } catch {
      setError("No se pudo eliminar la reseña.");
    } finally {
      setPendingReviewId(null);
    }
  };

  return (
    <main className="flex h-full max-h-screen overflow-hidden min-w-0 w-full flex-col gap-4 p-3 pt-16 sm:gap-5 sm:p-6 sm:pt-16 md:pt-6 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3 w-full ">
        <div className="flex flex-col gap-1 w-full">
          <h1 className="text-2xl font-bold">Reseñas</h1>
          <p className="text-sm text-foreground/65 w-full flex justify-between items-center">
            Administra las reseñas y su visibilidad pública.
            <span>
              Tienes {reviews.length}{" "}
              {reviews.length === 1 ? "reseña" : "reseñas"}
            </span>
          </p>
        </div>
      </header>

      {error && !dialog && (
        <p
          className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-background shadow-[0_0_10px_0px_rgba(0,0,0,0.2)] sm:rounded-4xl p-3">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <ThinkingOrb state="connecting" size={64} theme="light" />
          </div>
        ) : error && reviews.length === 0 ? (
          <p className="p-6 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : reviews.length === 0 ? (
          <p className="p-6 text-sm text-foreground/65">Aún no hay reseñas.</p>
        ) : (
          <>
            <ul className="grid h-full gap-3 overflow-y-auto md:hidden scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-black/0">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="min-w-0 rounded-xl border border-black/10 bg-background shadow p-4"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="wrap-break-word font-semibold">
                        {review.name}
                      </h2>
                      <p className="mt-1 line-clamp-3 whitespace-pre-wrap wrap-break-word text-sm text-foreground/70">
                        {review.text}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-amber-700">
                      {review.rate}/5
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={review.isActive}
                        disabled={pendingReviewId === review.id}
                        aria-label={`${review.isActive ? "Desactivar" : "Activar"} reseña de ${review.name}`}
                        onChange={() => void toggleReviewActive(review)}
                        className="peer sr-only"
                      />
                      <span
                        className={`relative h-6 w-11 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${review.isActive ? "bg-emerald-600" : "bg-black/25"}`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${review.isActive ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </span>
                      <span className="text-xs text-foreground/70">
                        {review.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Editar reseña"
                        aria-label={`Editar reseña de ${review.name}`}
                        disabled={pendingReviewId === review.id}
                        onClick={() => openEditDialog(review)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-black/5 disabled:opacity-40"
                      >
                        <IoCreateOutline size={19} />
                      </button>
                      <button
                        type="button"
                        title="Eliminar reseña"
                        aria-label={`Eliminar reseña de ${review.name}`}
                        disabled={pendingReviewId === review.id}
                        onClick={() => void removeReview(review)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-red-700 transition hover:bg-red-100 disabled:opacity-40"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden h-full overflow-auto md:block">
              <table className="w-full min-w-232 border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-background text-xs uppercase text-foreground/60">
                  <tr>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Cliente
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Reseña
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Calificación
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Visible
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {reviews.map((review) => (
                    <tr key={review.id} className="align-top">
                      <td className="max-w-48 px-5 py-4 font-semibold">
                        <span className="line-clamp-2 wrap-break-word">
                          {review.name}
                        </span>
                      </td>
                      <td className="max-w-md px-5 py-4">
                        <p className="line-clamp-2 whitespace-pre-wrap wrap-break-word text-foreground/75">
                          {review.text}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {review.rate}/5
                      </td>
                      <td className="px-5 py-4">
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={review.isActive}
                            disabled={pendingReviewId === review.id}
                            aria-label={`${review.isActive ? "Desactivar" : "Activar"} reseña de ${review.name}`}
                            onChange={() => void toggleReviewActive(review)}
                            className="peer sr-only"
                          />
                          <span
                            className={`relative h-6 w-11 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${review.isActive ? "bg-emerald-600" : "bg-black/25"}`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${review.isActive ? "translate-x-6" : "translate-x-1"}`}
                            />
                          </span>
                          <span className="text-xs text-foreground/70">
                            {review.isActive ? "Activa" : "Inactiva"}
                          </span>
                        </label>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar reseña"
                            aria-label={`Editar reseña de ${review.name}`}
                            disabled={pendingReviewId === review.id}
                            onClick={() => openEditDialog(review)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-black/5 disabled:opacity-40"
                          >
                            <IoCreateOutline size={19} />
                          </button>
                          <button
                            type="button"
                            title="Eliminar reseña"
                            aria-label={`Eliminar reseña de ${review.name}`}
                            disabled={pendingReviewId === review.id}
                            onClick={() => void removeReview(review)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-700 transition hover:bg-red-100 disabled:opacity-40"
                          >
                            <IoTrashOutline size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <AnimatePresence>
        {dialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSaving && setDialog(null)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-dialog-title"
              className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-background p-5 shadow-2xl sm:p-7"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 id="review-dialog-title" className="text-xl font-bold">
                    Editar reseña
                  </h2>
                  <p className="mt-1 text-sm text-foreground/65">
                    Edita el contenido y define si se muestra en la web.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  disabled={isSaving}
                  onClick={() => setDialog(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
                >
                  <IoClose size={20} />
                </button>
              </div>

              <form className="flex flex-col gap-4" onSubmit={saveReview}>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Nombre
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    maxLength={100}
                    className="h-11 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Reseña
                  <textarea
                    value={form.text}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                    required
                    rows={5}
                    maxLength={2000}
                    className="resize-y rounded-xl border border-black/15 bg-white/60 p-3 leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm font-medium">
                    Calificación
                    <input
                      type="number"
                      value={form.rate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          rate: Number(event.target.value),
                        }))
                      }
                      required
                      min={0.5}
                      max={5}
                      step={0.5}
                      className="h-10 w-20 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-amber-600">/ 5</span>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-emerald-700"
                    />
                    Visible en la web
                  </label>
                </div>
                {error && (
                  <p
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <div className="mt-2 flex justify-end gap-2 border-t border-black/10 pt-4">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setDialog(null)}
                    className="h-10 rounded-xl px-4 text-sm font-medium transition hover:bg-black/5 disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                  >
                    <IoSaveOutline aria-hidden="true" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
