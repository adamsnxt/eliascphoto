export enum AppointmentStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export interface Appointment {
  id: number;
  email: string;
  instagram: string;
  consultationTypeId: number;
  consultationTypeName: string;
  date: string;
  startTime: string;
  startAt: string;
  endAt: string;
  priceUsd: number;
  durationMinutes: number;
  status: AppointmentStatus;
}

export interface CreateAppointmentInput {
  email: string;
  instagram: string;
  consultationTypeId: number;
  date: string;
  startTime: string;
}

export interface RescheduleAppointmentInput {
  date: string;
  startTime: string;
}
