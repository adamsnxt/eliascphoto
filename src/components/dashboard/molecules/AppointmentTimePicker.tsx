"use client";

import { useMemo, useState } from "react";
import { IoChevronDown, IoTimeOutline } from "react-icons/io5";
import { Appointment } from "@/src/types/Appointments";

interface AppointmentTimePickerProps {
  value: string;
  appointments: Appointment[];
  durationMinutes: number;
  onChange: (startTime: string) => void;
}

const START_HOUR = 9;
const END_HOUR = 23;
const SLOT_MINUTES = 30;

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");

  const mins = (minutes % 60).toString().padStart(2, "0");

  return `${hours}:${mins}`;
};

const formatTime = (time: string) => {
  if (!time) return "";

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`1970-01-01T${time}:00`));
};

export function AppointmentTimePicker({
  value,
  appointments,
  durationMinutes,
  onChange,
}: AppointmentTimePickerProps) {
  const [open, setOpen] = useState(false);

  const occupiedRanges = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.id,
        start:
          new Date(appointment.startAt).getHours() * 60 +
          new Date(appointment.startAt).getMinutes(),
        end:
          new Date(appointment.endAt).getHours() * 60 +
          new Date(appointment.endAt).getMinutes(),
        name: appointment.consultationTypeName,
      })),
    [appointments],
  );

  const isOccupied = (startMinutes: number) => {
    const endMinutes = startMinutes + durationMinutes;

    return occupiedRanges.some(
      (range) => startMinutes < range.end && endMinutes > range.start,
    );
  };

  const slots = useMemo(() => {
    const result: string[] = [];

    for (
      let minutes = START_HOUR * 60;
      minutes <= END_HOUR * 60;
      minutes += SLOT_MINUTES
    ) {
      result.push(minutesToTime(minutes));
    }

    return result;
  }, []);

  const handleSelect = (time: string) => {
    const minutes = timeToMinutes(time);

    if (isOccupied(minutes)) return;

    onChange(time);
    setOpen(false);
  };

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-medium">Hora de inicio</label>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-foreground/10 bg-background px-3 py-2.5 text-left transition hover:border-foreground/20"
      >
        <span className={value ? "text-foreground" : "text-foreground/40"}>
          {value ? formatTime(value) : "Selecciona una hora"}
        </span>

        <IoChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-foreground/10 bg-background shadow-xl">
          <div className="flex items-center gap-2 border-b border-foreground/10 px-4 py-3">
            <IoTimeOutline className="text-primary" />

            <div>
              <p className="text-sm font-medium">Selecciona un horario</p>

              <p className="text-xs text-foreground/50">
                Los horarios ocupados están bloqueados
              </p>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {slots.map((time) => {
              const minutes = timeToMinutes(time);
              const occupied = isOccupied(minutes);
              const selected = value === time;

              const occupiedAppointment = occupiedRanges.find(
                (range) =>
                  minutes < range.end &&
                  minutes + durationMinutes > range.start,
              );

              return (
                <button
                  key={time}
                  type="button"
                  disabled={occupied}
                  onClick={() => handleSelect(time)}
                  className={[
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition",
                    selected && "bg-primary text-foreground",
                    !selected && !occupied && "hover:bg-foreground/5",
                    occupied && "cursor-not-allowed opacity-40",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span>{time}</span>

                  {occupied && occupiedAppointment ? (
                    <span className="text-xs">
                      Ocupado · {occupiedAppointment.name}
                    </span>
                  ) : selected ? (
                    <span className="text-xs">Seleccionado</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
