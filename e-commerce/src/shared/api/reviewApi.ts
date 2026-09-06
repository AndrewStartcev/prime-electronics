import { apiClient } from "./apiClient";

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  productId: string;
  userId: string | null;
  guestName: string | null;
  rating: number;
  comment: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  } | null;
  product: {
    id: string;
    name: string;
  };
}

export const reviewApi = {
  /**
   * Create a new review (requires authentication)
   */
  create: async (dto: CreateReviewDto): Promise<ReviewResponse> => {
    const response = await apiClient.post<ReviewResponse>("/reviews", dto);
    return response.data;
  },

  /**
   * Create a guest review (no authentication required)
   */
  createGuestReview: async (dto: CreateReviewDto): Promise<ReviewResponse> => {
    const response = await apiClient.post<ReviewResponse>(
      "/reviews/guest",
      dto,
    );
    return response.data;
  },
};
