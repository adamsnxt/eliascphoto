export interface ConsultationType {
  id: number;
  name: string;
  priceUsd: number;
  durationMinutes: number;
  active: boolean;
}

export type ConsultationTypeInput = Omit<ConsultationType, "id">;
