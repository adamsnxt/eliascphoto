import { Appointment, AppointmentStatus } from "@/src/types/Appointments";

export function getAppointmentLocalStart(appointment: Appointment): Date | null {
  const startAtMatch = appointment.startAt?.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/,
  );
  const date = startAtMatch?.[1] ?? appointment.date;
  const time = startAtMatch?.[2] ?? appointment.startTime?.slice(0, 5);
  if (!date || !time) return null;

  const start = new Date(`${date}T${time}:00`);
  return Number.isFinite(start.getTime()) ? start : null;
}

export function getAppointmentLocalTime(appointment: Appointment): string {
  const start = getAppointmentLocalStart(appointment);
  if (!start) return "";

  return `${String(start.getHours()).padStart(2, "0")}:${String(
    start.getMinutes(),
  ).padStart(2, "0")}`;
}

export function getAppointmentLocalRange(
  appointment: Appointment,
): { start: Date; end: Date } | null {
  const start = getAppointmentLocalStart(appointment);
  const durationMinutes = Number(appointment.durationMinutes);

  if (!start || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  return {
    start,
    end: new Date(start.getTime() + durationMinutes * 60_000),
  };
}

export function findAppointmentConflict(
  date: string,
  startTime: string,
  durationMinutes: number,
  appointments: Appointment[],
  excludedAppointmentId?: number,
): Appointment | null {
  if (!date || !startTime || durationMinutes <= 0) return null;

  const proposedStart = new Date(`${date}T${startTime}:00`).getTime();
  if (!Number.isFinite(proposedStart)) return null;
  const proposedEnd = proposedStart + durationMinutes * 60_000;

  return (
    appointments.find((appointment) => {
      if (
        appointment.id === excludedAppointmentId ||
        appointment.status === AppointmentStatus.CANCELLED
      ) {
        return false;
      }

      const existingRange = getAppointmentLocalRange(appointment);
      if (!existingRange) return false;

      const existingStart = existingRange.start.getTime();
      const existingEnd = existingRange.end.getTime();

      return (
        Number.isFinite(existingStart) &&
        Number.isFinite(existingEnd) &&
        proposedStart <= existingEnd &&
        proposedEnd > existingStart
      );
    }) ?? null
  );
}