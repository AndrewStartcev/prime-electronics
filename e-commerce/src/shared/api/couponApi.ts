import { apiClient } from "./apiClient";

export interface CouponValidationResponse {
  valid: boolean;
  coupon: {
    id: string;
    code: string;
    type: string;
    value: number | string;
  };
}

export const couponApi = {
  validate: async (code: string): Promise<CouponValidationResponse> => {
    const response = await apiClient.post<CouponValidationResponse>(
      "/coupons/validate",
      { code },
    );
    return response.data;
  },
};
