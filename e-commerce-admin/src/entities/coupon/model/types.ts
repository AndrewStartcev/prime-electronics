// Coupon entity types согласно ТЗ
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // процент или фиксированная сумма
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = "percentage" | "fixed";

export interface CouponFormData {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  isActive: boolean;
}

export const couponTypeLabels: Record<CouponType, string> = {
  percentage: "Процент",
  fixed: "Фиксированная сумма",
};
