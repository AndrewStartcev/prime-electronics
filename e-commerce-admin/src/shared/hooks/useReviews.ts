import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface Review {
  id: string;
  productId: string;
  userId: string | null;
  guestName?: string;
  rating: number;
  comment?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  product: {
    id: string;
    name: string;
    slug?: string;
    images?: Array<{ id?: string; url?: string } | string>;
  };
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  guestName?: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  avgRating: number;
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useReviews(params?: {
  productId?: string;
  isActive?: boolean;
  search?: string;
  rating?: number;
  sortBy?: "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  return useQuery<ReviewsResponse>({
    queryKey: ["reviews", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.productId) searchParams.append("productId", params.productId);
      if (params?.isActive !== undefined)
        searchParams.append("isActive", String(params.isActive));
      if (params?.search) searchParams.append("search", params.search);
      if (params?.rating !== undefined)
        searchParams.append("rating", String(params.rating));
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);
      if (params?.page) searchParams.append("page", String(params.page));
      if (params?.limit) searchParams.append("limit", String(params.limit));

      const { data } = await apiClient.get<ReviewsResponse>(
        `/reviews?${searchParams}`,
      );
      return data;
    },
  });
}

export function useReview(id: string) {
  return useQuery<Review>({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Review>(`/reviews/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useReviewStats() {
  return useQuery<ReviewStats>({
    queryKey: ["reviews", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewStats>("/reviews/stats");
      return data;
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/reviews/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/reviews/${id}/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/reviews/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateReviewDto;
    }) => {
      const { data: response } = await apiClient.patch(`/reviews/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
    },
  });
}
