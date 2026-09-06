import { apiClient } from "./client";

export type DiscountType = "PERCENTAGE" | "FIXED";

interface BackendCoupon {
  id: string;
  code: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  usageLimit?: number;
  usageCount?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy fields (if server still returns old shape)
  discountType?: DiscountType;
  discountValue?: number;
  maxUses?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  minOrderAmount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxUses?: number;
  usesPerUser?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  // New backend fields (for compatibility)
  type?: DiscountType;
  value?: number;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

const COUPONS_MAX_LIMIT = 100;

const toDateString = (date: Date): string => date.toISOString().split("T")[0];

const getDefaultStartDate = () => toDateString(new Date());

const getDefaultEndDate = () => {
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  return toDateString(oneYearLater);
};

const normalizeIsoDateToDateString = (
  value?: string,
): string | undefined => {
  if (!value) return undefined;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return undefined;

  return toDateString(parsedDate);
};

const mapBackendCoupon = (coupon: BackendCoupon): Coupon => ({
  id: coupon.id,
  code: coupon.code,
  description: coupon.description,
  discountType: (coupon.discountType || coupon.type || "PERCENTAGE") as DiscountType,
  discountValue: Number(coupon.discountValue ?? coupon.value ?? 0),
  minOrderAmount: coupon.minOrderAmount,
  maxUses: coupon.maxUses ?? coupon.usageLimit,
  usedCount: coupon.usedCount ?? coupon.usageCount ?? 0,
  startDate: coupon.startDate || coupon.validFrom,
  endDate: coupon.endDate || coupon.validTo,
  isActive: coupon.isActive,
  createdAt: coupon.createdAt,
  updatedAt: coupon.updatedAt,
});

const buildCreatePayload = (data: CreateCouponDto) => {
  const discountType = data.discountType ?? data.type ?? "PERCENTAGE";
  const discountValue = Number(data.discountValue ?? data.value ?? 0);
  const startDate =
    data.startDate ??
    normalizeIsoDateToDateString(data.validFrom) ??
    getDefaultStartDate();
  const endDate =
    data.endDate ??
    normalizeIsoDateToDateString(data.validTo) ??
    getDefaultEndDate();

  return {
    code: data.code,
    discountType,
    discountValue,
    maxUses: data.maxUses ?? data.usageLimit ?? 0,
    startDate,
    endDate,
    isActive: data.isActive ?? true,
  };
};

const buildUpdatePayload = (data: UpdateCouponDto) => {
  const payload: Record<string, unknown> = {};

  if (data.code !== undefined) payload.code = data.code;
  if (data.isActive !== undefined) payload.isActive = data.isActive;

  const discountType = data.discountType ?? data.type;
  const discountValue = data.discountValue ?? data.value;
  const maxUses = data.maxUses ?? data.usageLimit;
  const startDate = data.startDate ?? normalizeIsoDateToDateString(data.validFrom);
  const endDate = data.endDate ?? normalizeIsoDateToDateString(data.validTo);

  if (discountType !== undefined) payload.discountType = discountType;
  if (discountValue !== undefined) payload.discountValue = Number(discountValue);
  if (maxUses !== undefined) payload.maxUses = maxUses;
  if (startDate !== undefined) payload.startDate = startDate;
  if (endDate !== undefined) payload.endDate = endDate;

  return payload;
};

const normalizePaginationParams = (params?: PaginationParams): PaginationParams | undefined => {
  if (!params) return undefined;

  const normalized: PaginationParams = { ...params };

  if (typeof normalized.limit === "number") {
    normalized.limit = Math.min(COUPONS_MAX_LIMIT, Math.max(1, normalized.limit));
  }

  if (typeof normalized.page === "number") {
    normalized.page = Math.max(1, normalized.page);
  }

  return normalized;
};

export const couponsApi = {
  getAll: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Coupon>> => {
    const response = await apiClient.get<PaginatedResponse<BackendCoupon>>("/coupons", {
      params: normalizePaginationParams(params),
    });
    return {
      ...response.data,
      data: response.data.data.map(mapBackendCoupon),
    };
  },

  getById: async (id: string): Promise<Coupon> => {
    const response = await apiClient.get<BackendCoupon>(`/coupons/${id}`);
    return mapBackendCoupon(response.data);
  },

  getActive: async (): Promise<Coupon[]> => {
    const response = await apiClient.get<BackendCoupon[]>("/coupons/active");
    return response.data.map(mapBackendCoupon);
  },

  create: async (data: CreateCouponDto): Promise<Coupon> => {
    const response = await apiClient.post<BackendCoupon>("/coupons", buildCreatePayload(data));
    return mapBackendCoupon(response.data);
  },

  update: async (id: string, data: UpdateCouponDto): Promise<Coupon> => {
    const response = await apiClient.patch<BackendCoupon>(`/coupons/${id}`, buildUpdatePayload(data));
    return mapBackendCoupon(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },

  validate: async (code: string): Promise<Coupon> => {
    const response = await apiClient.post<{ valid: boolean; coupon: BackendCoupon }>(
      "/coupons/validate",
      { code }
    );
    return mapBackendCoupon(response.data.coupon);
  },

  getDeleted: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Coupon>> => {
    const response = await apiClient.get<PaginatedResponse<BackendCoupon>>("/coupons/deleted/list", {
      params: normalizePaginationParams(params),
    });
    return {
      ...response.data,
      data: response.data.data.map(mapBackendCoupon),
    };
  },

  restore: async (id: string): Promise<Coupon> => {
    const response = await apiClient.post<BackendCoupon>(`/coupons/${id}/restore`);
    return mapBackendCoupon(response.data);
  },
};
