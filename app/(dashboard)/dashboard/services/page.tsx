"use client";

import {
  createConsultationType,
  deactivateConsultationType,
  getManagedConsultationTypes,
  updateConsultationType,
} from "@/src/actions/ConsultationTypeActions";
import type {
  ConsultationType,
  ConsultationTypeInput,
} from "@/src/types/ConsultationTypes";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import {
  IoAdd,
  IoCheckmarkCircleOutline,
  IoClose,
  IoCreateOutline,
  IoPauseCircleOutline,
  IoSaveOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { ThinkingOrb } from "thinking-orbs";

const EMPTY_FORM: ConsultationTypeInput = {
  name: "",
  priceUsd: 0,
  durationMinutes: 30,
  active: true,
};

const formatPrice = (priceUsd: number) =>
  new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
  }).format(priceUsd);

export default function ServicesDashboardPage() {
  const [consultationTypes, setConsultationTypes] = useState<
    ConsultationType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<ConsultationTypeInput>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTypeId, setPendingTypeId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTypes = async () => {
      const result = await getManagedConsultationTypes();
      if (!isMounted) return;
      if (result.success) {
        setConsultationTypes(result.consultationTypes);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    };

    void loadTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateDialog = () => {
    setSelectedType(null);
    setForm(EMPTY_FORM);
    setError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (consultationType: ConsultationType) => {
    setSelectedType(consultationType);
    setForm({
      name: consultationType.name,
      priceUsd: consultationType.priceUsd,
      durationMinutes: consultationType.durationMinutes,
      active: consultationType.active,
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const saveConsultationType = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const result = selectedType
        ? await updateConsultationType(selectedType.id, form)
        : await createConsultationType(form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.consultationType) {
        const saved = result.consultationType;
        setConsultationTypes((current) =>
          selectedType
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [saved, ...current],
        );
      }
      setIsDialogOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el tipo de asesoría.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const setActive = async (
    consultationType: ConsultationType,
    active: boolean,
  ) => {
    setPendingTypeId(consultationType.id);
    setError(null);
    try {
      const result = await updateConsultationType(consultationType.id, {
        name: consultationType.name,
        priceUsd: consultationType.priceUsd,
        durationMinutes: consultationType.durationMinutes,
        active,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConsultationTypes((current) =>
        current.map((item) =>
          item.id === consultationType.id
            ? { ...item, ...(result.consultationType ?? {}), active }
            : item,
        ),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo actualizar el estado del servicio.",
      );
    } finally {
      setPendingTypeId(null);
    }
  };

  const deactivate = async (consultationType: ConsultationType) => {
    if (
      !window.confirm(
        `¿Desactivar “${consultationType.name}”? No se borrará el historial de turnos.`,
      )
    ) {
      return;
    }

    setPendingTypeId(consultationType.id);
    setError(null);
    try {
      const result = await deactivateConsultationType(consultationType.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConsultationTypes((current) =>
        current.map((item) =>
          item.id === consultationType.id ? { ...item, active: false } : item,
        ),
      );
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : "No se pudo desactivar el servicio.",
      );
    } finally {
      setPendingTypeId(null);
    }
  };

  return (
    <main className="flex h-full max-h-screen min-h-0 min-w-0 w-full flex-col gap-4 overflow-hidden p-4 pb-6 md:gap-5 md:pb-4">
      <header className="flex w-full gap-3 pl-12 md:pl-0">
        <div className="flex w-full justify-between items-center ">
          <div className=" flex flex-col flex-2">
            <h1 className="text-2xl font-bold">Servicios</h1>
            <p className="mt-1 text-sm text-foreground/65">
              Tipos de asesoría.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateDialog}
            className="h-full aspect-square flex justify-center items-center gap-2 rounded-xl px-4 font-semibold transition bg-background shadow-[0_0_10px_0px_rgba(0,0,0,0.3)]"
          >
            <IoAdd aria-hidden="true" size={24} />
          </button>
        </div>
      </header>

      {error && !isDialogOpen && (
        <p
          className="shrink-0 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-background p-3 shadow-[0_0_10px_0px_rgba(0,0,0,0.2)] sm:rounded-4xl">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center p-4">
            <ThinkingOrb state="connecting" size={64} theme="light" />
          </div>
        ) : error && consultationTypes.length === 0 ? (
          <p className="p-6 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : consultationTypes.length === 0 ? (
          <p className="p-6 text-sm text-foreground/65">
            Aún no hay tipos de asesoría.
          </p>
        ) : (
          <>
            <ul className="grid min-h-0 flex-1 gap-3 overflow-y-auto md:hidden">
              {consultationTypes.map((consultationType) => (
                <li
                  key={consultationType.id}
                  className="rounded-xl border border-black/10 bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="wrap-break-word font-semibold">
                        {consultationType.name}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/70">
                        <span className="font-medium text-foreground">
                          {formatPrice(consultationType.priceUsd)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IoTimeOutline aria-hidden="true" />
                          {consultationType.durationMinutes} min
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${consultationType.active ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-foreground/65"}`}
                    >
                      {consultationType.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={consultationType.active}
                        disabled={pendingTypeId === consultationType.id}
                        aria-label={`${consultationType.active ? "Desactivar" : "Activar"} ${consultationType.name}`}
                        onChange={(event) =>
                          void setActive(consultationType, event.target.checked)
                        }
                        className="peer sr-only"
                      />
                      <span
                        className={`relative h-6 w-11 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${consultationType.active ? "bg-emerald-600" : "bg-black/25"}`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${consultationType.active ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </span>
                      <span className="text-xs text-foreground/70">Activo</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Editar servicio"
                        aria-label={`Editar ${consultationType.name}`}
                        disabled={pendingTypeId === consultationType.id}
                        onClick={() => openEditDialog(consultationType)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-black/5 disabled:opacity-40"
                      >
                        <IoCreateOutline size={19} />
                      </button>
                      {consultationType.active && (
                        <button
                          type="button"
                          title="Desactivar servicio"
                          aria-label={`Desactivar ${consultationType.name}`}
                          disabled={pendingTypeId === consultationType.id}
                          onClick={() => void deactivate(consultationType)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-amber-800 transition hover:bg-amber-100 disabled:opacity-40"
                        >
                          <IoPauseCircleOutline size={20} />
                        </button>
                      )}
                      {!consultationType.active && (
                        <button
                          type="button"
                          title="Activar servicio"
                          aria-label={`Activar ${consultationType.name}`}
                          disabled={pendingTypeId === consultationType.id}
                          onClick={() => void setActive(consultationType, true)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-40"
                        >
                          <IoCheckmarkCircleOutline size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden min-h-0 min-w-0 flex-1 overflow-auto md:block">
              <table className="w-full min-w-176 border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-background text-xs uppercase text-foreground/60">
                  <tr>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Servicio
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Precio
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Duración
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 font-semibold">
                      Estado
                    </th>
                    <th className="border-b border-black/10 px-5 py-4 text-right font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {consultationTypes.map((consultationType) => (
                    <tr key={consultationType.id}>
                      <td className="max-w-80 px-5 py-4 font-semibold">
                        <span className="wrap-break-word">
                          {consultationType.name}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {formatPrice(consultationType.priceUsd)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {consultationType.durationMinutes} min
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${consultationType.active ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-foreground/65"}`}
                        >
                          {consultationType.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar servicio"
                            aria-label={`Editar ${consultationType.name}`}
                            disabled={pendingTypeId === consultationType.id}
                            onClick={() => openEditDialog(consultationType)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-black/5 disabled:opacity-40"
                          >
                            <IoCreateOutline size={19} />
                          </button>
                          {consultationType.active ? (
                            <button
                              type="button"
                              title="Desactivar servicio"
                              aria-label={`Desactivar ${consultationType.name}`}
                              disabled={pendingTypeId === consultationType.id}
                              onClick={() => void deactivate(consultationType)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-800 transition hover:bg-amber-100 disabled:opacity-40"
                            >
                              <IoPauseCircleOutline size={20} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Activar servicio"
                              aria-label={`Activar ${consultationType.name}`}
                              disabled={pendingTypeId === consultationType.id}
                              onClick={() =>
                                void setActive(consultationType, true)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-40"
                            >
                              <IoCheckmarkCircleOutline size={20} />
                            </button>
                          )}
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
        {isDialogOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => !isSaving && setIsDialogOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="consultation-type-dialog-title"
              className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-background p-5 shadow-2xl sm:p-7"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="consultation-type-dialog-title"
                    className="text-xl font-bold"
                  >
                    {selectedType ? "Editar servicio" : "Nuevo servicio"}
                  </h2>
                  <p className="mt-1 text-sm text-foreground/65">
                    Define nombre, precio, duración y disponibilidad.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  disabled={isSaving}
                  onClick={() => setIsDialogOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
                >
                  <IoClose size={20} />
                </button>
              </div>

              <form
                className="flex flex-col gap-4"
                onSubmit={saveConsultationType}
              >
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Nombre del servicio
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                    maxLength={120}
                    className="h-11 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Precio (USD)
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.priceUsd}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          priceUsd: Number(event.target.value),
                        }))
                      }
                      required
                      min={0}
                      step={0.01}
                      className="h-11 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Duración (minutos)
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.durationMinutes}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          durationMinutes: Number(event.target.value),
                        }))
                      }
                      required
                      min={1}
                      step={1}
                      className="h-11 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  Disponible para reservar
                </label>
                {error && (
                  <p
                    className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap justify-end gap-2 border-t border-black/10 pt-4">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsDialogOpen(false)}
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
                    {isSaving ? "Guardando..." : "Guardar servicio"}
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
