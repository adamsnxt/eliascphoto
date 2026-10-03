export interface Review {
  id: number;
  name: string;
  text: string;
  rate: number;
  isActive: boolean;
}

export type ReviewInput = Omit<Review, "id">;
