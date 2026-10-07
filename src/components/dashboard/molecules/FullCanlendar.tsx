"use client";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { Appointment, AppointmentStatus } from "@/src/types/Appointments";
import { getAppointments } from "@/src/actions/AppointmentActions";
import { ThinkingOrb } from "thinking-orbs";

dayjs.locale("es");

const localizer = dayjsLocalizer(dayjs);

export const FullCalendar = ({
  appointmentsRefreshKey,
  openDateAppointments,
}: {
  appointmentsRefreshKey: number;
  openDateAppointments: (date: string, appointments: Appointment[]) => void;
}) => {
  const [date, setDate] = useState(new Date());
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

  const events = appointments.map((appointment) => ({
    ...appointment,
    title: `${appointment.email} - ${appointment.consultationTypeName}`,
    start: new Date(appointment.startAt),
    end: new Date(appointment.endAt),
  }));

  const eventPropGetter = (
    event: (typeof events)[number],
    start: Date,
    end: Date,
    isSelected: boolean,
  ) => {
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
            const selectedDate = dayjs(slotInfo.start).format("YYYY-MM-DD");

            const appointmentsForDate = appointments.filter(
              (appointment) =>
                dayjs(appointment.startAt).format("YYYY-MM-DD") ===
                selectedDate,
            );

            openDateAppointments(selectedDate, appointmentsForDate);
          }}
        />
      )}
    </div>
  );
};
