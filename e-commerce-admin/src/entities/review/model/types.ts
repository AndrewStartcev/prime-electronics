// Review entity types согласно ТЗ
export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  moderatorId?: string;
  moderatorComment?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  pending: "На модерации",
  approved: "Одобрен",
  rejected: "Отклонен",
};
