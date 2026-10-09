"use client";
import { getManagedConsultationTypes } from "@/src/actions/ConsultationTypeActions";
import { Appointment, CreateAppointmentInput } from "@/src/types/Appointments";
import { ConsultationType } from "@/src/types/ConsultationTypes";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoClose, IoSaveOutline, IoLogoUsd } from "react-icons/io5";
import { ThinkingOrb } from "thinking-orbs";
import { MdOutlineCancel } from "react-icons/md";
const EMPTY_FORM = {
  email: "",
  instagram: "",
  consultationTypeId: 0,
  date: "",
  startTime: "",
};
import { FullCalendar } from "@/src/components/dashboard/molecules";
import {
  cancelAppointment,
  createAppointment,
  markAppointmentPaid,
  rescheduleAppointment,
} from "@/src/actions/AppointmentActions";
import { AppointmentTimePicker } from "@/src/components/dashboard/molecules/AppointmentTimePicker";
import {
  findAppointmentConflict,
  getAppointmentLocalTime,
} from "@/src/components/dashboard/molecules/appointmentAvailability";
import {
  SectionDashboardLayout,
  MainDashboardLayout,
} from "@/src/components/dashboard/layouts";

export default function AppointmentsPage() {
  const [consultationTypes, setConsultationTypes] = useState<
    ConsultationType[]
  >([]);

  const [isConsultationTypesLoading, setIsConsultationTypesLoading] =
    useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CreateAppointmentInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [selectedDateAppointments, setSelectedDateAppointments] = useState<
    Appointment[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppointment(null);
    setForm(EMPTY_FORM);
    setError(null);
    setIsEditing(false);
  };

  const openDay = (date: string, appointments: Appointment[]) => {
    setSelectedDateAppointments(appointments);
    setForm((current) => ({
      ...current,
      date,
    }));
  };

  const openCreateDialog = (date: string, appointments: Appointment[]) => {
    setSelectedDateAppointments(appointments);
    setSelectedAppointment(null);
    setIsEditing(false);

    setForm({
      ...EMPTY_FORM,
      date,
    });

    setError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (
    appointment: Appointment,
    date: string,
    appointments: Appointment[],
  ) => {
    setSelectedDateAppointments(appointments);
    setIsEditing(true);
    setSelectedAppointment(appointment);

    setForm({
      email: appointment.email,
      instagram: appointment.instagram,
      consultationTypeId: appointment.consultationTypeId,
      date,
      startTime: getAppointmentLocalTime(appointment),
    });

    setError(null);
    setIsDialogOpen(true);
  };

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
      setIsConsultationTypesLoading(false);
    };

    void loadTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedConsultationType = consultationTypes.find(
    (type) => type.id === form.consultationTypeId,
  );

  const isTimeOccupied = (startTime: string) => {
    return Boolean(
      selectedConsultationType &&
      findAppointmentConflict(
        form.date,
        startTime,
        selectedConsultationType.durationMinutes,
        selectedDateAppointments,
        selectedAppointment?.id,
      ),
    );
  };

  const paid = async (id: number) => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await markAppointmentPaid(id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAppointmentsRefreshKey((prev) => prev + 1);
      closeDialog();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo marcar el turno como pagado.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = async (id: number) => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await cancelAppointment(id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAppointmentsRefreshKey((prev) => prev + 1);
      closeDialog();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar el turno",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const submitNewAppointment = async () => {
    if (isTimeOccupied(form.startTime)) {
      setError("Ese horario se solapa con otro turno.");
      return;
    }

    setIsSaving(true);

    try {
      const result =
        isEditing && selectedAppointment
          ? await rescheduleAppointment(selectedAppointment.id, {
              date: form.date,
              startTime: form.startTime,
            })
          : await createAppointment(form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAppointmentsRefreshKey((prev) => prev + 1);

      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el turno");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainDashboardLayout>
      <header className="flex items-end justify-between gap-3 pl-12 md:pl-0">
        <div>
          <h1 className="text-2xl font-bold">Turnos</h1>
          <p className="mt-1 text-sm text-foreground/65">Gestión de turnos</p>
        </div>
      </header>
      <SectionDashboardLayout>
        <FullCalendar
          appointmentsRefreshKey={appointmentsRefreshKey}
          onOpenDay={openDay}
          onCreateAppointment={openCreateDialog}
          onEditAppointment={openEditDialog}
        />
      </SectionDashboardLayout>
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => closeDialog()}
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
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="consultation-type-dialog-title"
                      className="text-xl font-bold"
                    >
                      {selectedAppointment ? "Editar" : "Nuevo"}
                    </h2>
                    <p className="mt-1 text-sm text-foreground/65">
                      {selectedAppointment ? "Editar turno" : "Nuevo turno"}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    disabled={isSaving}
                    onClick={() => closeDialog()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5 disabled:opacity-40"
                  >
                    <IoClose size={20} />
                  </button>
                </div>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitNewAppointment();
                  }}
                >
                  <p>
                    Editar o crear un turno{" "}
                    {form.date &&
                      new Intl.DateTimeFormat("es", {
                        dateStyle: "medium",
                      }).format(new Date(form.date))}
                  </p>
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Mail
                    <input
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      required
                      maxLength={120}
                      className="h-11 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-medium">
                    Instagram
                    <input
                      value={form.instagram}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          instagram: event.target.value,
                        }))
                      }
                      required
                      maxLength={120}
                      className="h-11 rounded-xl border border-black/15 bg-white/60 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  {isConsultationTypesLoading ? (
                    <div className="w-full flex justify-center items-center">
                      <ThinkingOrb state="connecting" size={20} theme="light" />
                    </div>
                  ) : (
                    <select
                      name="consultationType"
                      value={form.consultationTypeId || ""}
                      onChange={(e) => {
                        const consultationTypeId = Number(e.target.value);

                        setForm((prev) => ({
                          ...prev,
                          consultationTypeId,
                        }));

                        const newConsultationType = consultationTypes.find(
                          (type) => type.id === consultationTypeId,
                        );

                        if (!newConsultationType || !form.startTime) {
                          setError(null);
                          return;
                        }

                        const hasOverlap = findAppointmentConflict(
                          form.date,
                          form.startTime,
                          newConsultationType.durationMinutes,
                          selectedDateAppointments,
                          selectedAppointment?.id,
                        );

                        setError(
                          hasOverlap !== null
                            ? "Ese horario no está disponible para esta duración."
                            : null,
                        );
                      }}
                      required
                      className="w-full p-3 rounded-2xl bg-background shadow border-none outline-none cursor-pointer active:scale-99 transition-all duration-300"
                    >
                      <option value="">Selecciona un tipo de asesoría</option>

                      {consultationTypes
                        .filter((type) => type.active)
                        .map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                    </select>
                  )}
                  <AppointmentTimePicker
                    value={form.startTime}
                    date={form.date}
                    appointments={selectedDateAppointments}
                    durationMinutes={
                      selectedConsultationType?.durationMinutes ?? 0
                    }
                    excludedAppointmentId={selectedAppointment?.id}
                    onChange={(startTime) =>
                      setForm((current) => ({
                        ...current,
                        startTime,
                      }))
                    }
                  />
                  {error && (
                    <p
                      className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-black/10 pt-4">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => closeDialog()}
                      className="h-10 rounded-xl px-4 text-sm font-medium transition hover:bg-black/5 disabled:opacity-40 bg-red-600 text-white"
                    >
                      Cerrar
                    </button>
                    <div className="flex justify-center items-center gap-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                      >
                        <IoSaveOutline aria-hidden="true" />
                        {isSaving ? (
                          <ThinkingOrb
                            state="connecting"
                            size={20}
                            theme="light"
                          />
                        ) : isEditing ? (
                          "Editar"
                        ) : (
                          "Crear turno"
                        )}
                      </button>
                      {isEditing && (
                        <>
                          {" "}
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                              if (selectedAppointment) {
                                void paid(selectedAppointment.id);
                              }
                            }}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                          >
                            <IoLogoUsd aria-hidden="true" />

                            {isSaving ? (
                              <ThinkingOrb
                                state="connecting"
                                size={20}
                                theme="light"
                              />
                            ) : (
                              "Marcar como Pagado"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                              if (selectedAppointment) {
                                void cancel(selectedAppointment.id);
                              }
                            }}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                          >
                            <MdOutlineCancel aria-hidden="true" />

                            {isSaving ? (
                              <ThinkingOrb
                                state="connecting"
                                size={20}
                                theme="light"
                              />
                            ) : (
                              "Cancelar turno"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </MainDashboardLayout>
  );
}
