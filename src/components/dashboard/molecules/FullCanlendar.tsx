"use client";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { Appointment, AppointmentStatus } from "@/src/types/Appointments";
import { getAppointments } from "@/src/actions/AppointmentActions";
import { ThinkingOrb } from "thinking-orbs";
import {
  getAppointmentLocalRange,
  getAppointmentLocalStart,
} from "./appointmentAvailability";
import {
  IoAdd,
  IoArrowBack,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

dayjs.locale("es");

const localizer = dayjsLocalizer(dayjs);

export const FullCalendar = ({
  appointmentsRefreshKey,
  onOpenDay,
  onCreateAppointment,
  onEditAppointment,
}: {
  appointmentsRefreshKey: number;
  onOpenDay: (date: string, appointments: Appointment[]) => void;
  onCreateAppointment: (date: string, appointments: Appointment[]) => void;
  onEditAppointment: (
    appointment: Appointment,
    date: string,
    appointments: Appointment[],
  ) => void;
}) => {
  const [date, setDate] = useState(new Date());
  const [dayViewDate, setDayViewDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const messages = {
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    today: "Hoy",
    previous: "Anterior",
    next: "Siguiente",
    noEventsInRange: "No hay eventos en este período.",
    showMore: (total: number) => `+${total} más`,
  };

  const events = appointments.flatMap((appointment) => {
    const range = getAppointmentLocalRange(appointment);
    if (!range) return [];

    return [
      {
        ...appointment,
        title: `${appointment.email} - ${appointment.consultationTypeName}`,
        start: range.start,
        end: range.end,
      },
    ];
  });

  const getAppointmentsForDate = (selectedDate: string) =>
    appointments
      .filter((appointment) => {
        const start = getAppointmentLocalStart(appointment);
        return (
          start !== null &&
          dayjs(start).format("YYYY-MM-DD") === selectedDate
        );
      })
      .sort((first, second) => {
        const firstStart = getAppointmentLocalStart(first)?.getTime() ?? 0;
        const secondStart = getAppointmentLocalStart(second)?.getTime() ?? 0;
        return firstStart - secondStart;
      });

  const openDayView = (selectedDate: Date) => {
    const localDate = dayjs(selectedDate).format("YYYY-MM-DD");
    const appointmentsForDate = getAppointmentsForDate(localDate);
    setDayViewDate(selectedDate);
    onOpenDay(localDate, appointmentsForDate);
  };

  const statusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PAID:
        return "Pagado";
      case AppointmentStatus.CANCELLED:
        return "Cancelado";
      default:
        return "Pendiente de pago";
    }
  };

  const statusClassName = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PAID:
        return "bg-green-100 text-green-800";
      case AppointmentStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-900";
    }
  };

  const eventPropGetter = (event: (typeof events)[number]) => {
    switch (event.status) {
      case AppointmentStatus.PAID:
        return {
          style: {
            backgroundColor: "#16a34a",
            borderColor: "#16a34a",
            color: "#fff",
          },
        };

      case AppointmentStatus.PENDING_PAYMENT:
        return {
          style: {
            backgroundColor: "var(--primary)",
            borderColor: "#f59e0b",
            color: "#fff",
          },
        };

      case AppointmentStatus.CANCELLED:
        return {
          style: {
            opacity: 0.5,
            backgroundColor: "#dc2626",
            borderColor: "#dc2626",
            color: "#fff",
          },
        };

      default:
        return {};
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const req = await getAppointments();
        setAppointments(req.appointments);
      } catch (err) {
        throw new Error(err as string);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, [appointmentsRefreshKey]);

  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="w-full h-full flex justify-center items-center">
          <ThinkingOrb state="connecting" theme="light" size={64} />
        </div>
      ) : dayViewDate ? (
        <section className="flex h-full min-h-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDate(dayViewDate);
                  setDayViewDate(null);
                }}
                aria-label="Volver al calendario"
                title="Volver al calendario"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 transition hover:bg-foreground/5"
              >
                <IoArrowBack aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold capitalize">
                  {dayjs(dayViewDate).format("dddd D [de] MMMM YYYY")}
                </h2>
                <p className="text-sm text-foreground/60">
                  {getAppointmentsForDate(
                    dayjs(dayViewDate).format("YYYY-MM-DD"),
                  ).length}{" "}
                  turnos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Día anterior"
                title="Día anterior"
                onClick={() => {
                  const previousDay = dayjs(dayViewDate)
                    .subtract(1, "day")
                    .toDate();
                  setDayViewDate(previousDay);
                  const selectedDate = dayjs(previousDay).format("YYYY-MM-DD");
                  onOpenDay(selectedDate, getAppointmentsForDate(selectedDate));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/15 transition hover:bg-foreground/5"
              >
                <IoChevronBack aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Día siguiente"
                title="Día siguiente"
                onClick={() => {
                  const nextDay = dayjs(dayViewDate).add(1, "day").toDate();
                  setDayViewDate(nextDay);
                  const selectedDate = dayjs(nextDay).format("YYYY-MM-DD");
                  onOpenDay(selectedDate, getAppointmentsForDate(selectedDate));
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/15 transition hover:bg-foreground/5"
              >
                <IoChevronForward aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Crear turno"
                title="Crear turno"
                onClick={() => {
                  const selectedDate = dayjs(dayViewDate).format("YYYY-MM-DD");
                  onCreateAppointment(
                    selectedDate,
                    getAppointmentsForDate(selectedDate),
                  );
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition hover:brightness-110"
              >
                <IoAdd size={22} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            {getAppointmentsForDate(
              dayjs(dayViewDate).format("YYYY-MM-DD"),
            ).length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-foreground/60">
                No hay turnos para este día.
              </div>
            ) : (
              <ul className="divide-y divide-foreground/10">
                {getAppointmentsForDate(
                  dayjs(dayViewDate).format("YYYY-MM-DD"),
                ).map((appointment) => {
                  const range = getAppointmentLocalRange(appointment);
                  const startLabel = range
                    ? dayjs(range.start).format("HH:mm")
                    : getAppointmentLocalStart(appointment)
                      ? dayjs(getAppointmentLocalStart(appointment)).format(
                          "HH:mm",
                        )
                      : "--:--";
                  const endLabel = range
                    ? dayjs(range.end).format("HH:mm")
                    : "--:--";

                  return (
                    <li key={appointment.id}>
                      <button
                        type="button"
                        onClick={() =>
                          onEditAppointment(
                            appointment,
                            dayjs(dayViewDate).format("YYYY-MM-DD"),
                            getAppointmentsForDate(
                              dayjs(dayViewDate).format("YYYY-MM-DD"),
                            ),
                          )
                        }
                        className="flex w-full flex-wrap items-center gap-x-5 gap-y-3 py-4 text-left transition hover:bg-foreground/[0.03]"
                      >
                        <span className="w-28 shrink-0 font-semibold tabular-nums">
                          {startLabel}–{endLabel}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            {appointment.email}
                          </span>
                          <span className="block truncate text-sm text-foreground/60">
                            {appointment.consultationTypeName}
                            {appointment.instagram
                              ? ` · ${appointment.instagram}`
                              : ""}
                          </span>
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusClassName(appointment.status)}`}
                        >
                          {statusLabel(appointment.status)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventPropGetter}
          selectable
          date={date}
          onNavigate={(newDate) => {
            setDate(newDate);
          }}
          messages={messages}
          onSelectSlot={(slotInfo) => {
            openDayView(slotInfo.start);
          }}
          onSelectEvent={(event) => openDayView(event.start)}
        />
      )}
    </div>
  );
};
