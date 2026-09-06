export const CARD_SURCHARGE_PERCENT = 10;

export type PaymentMethodChoice = "cash" | "card";

export interface PaymentPriceBreakdown {
  cardPrice: number;
  cashPrice: number;
  surchargePercent: number;
  surchargeAmount: number;
  // Backward-compatible aliases for legacy call sites.
  discountPercent: number;
  discountAmount: number;
}

const roundRub = (value: number): number => Math.round(value);

export const calculatePaymentPriceBreakdown = (
  basePrice: number,
  surchargePercent: number = CARD_SURCHARGE_PERCENT,
): PaymentPriceBreakdown => {
  const safeBasePrice = Number.isFinite(basePrice) ? Math.max(basePrice, 0) : 0;
  const safeSurcharge = Math.max(surchargePercent, 0);

  const cashPrice = roundRub(safeBasePrice);
  const cardPrice = roundRub(safeBasePrice * (1 + safeSurcharge / 100));
  const surchargeAmount = Math.max(cardPrice - cashPrice, 0);

  return {
    cardPrice,
    cashPrice,
    surchargePercent: safeSurcharge,
    surchargeAmount,
    discountPercent: safeSurcharge,
    discountAmount: surchargeAmount,
  };
};

export const formatRubPrice = (value: number): string =>
  roundRub(value).toLocaleString("ru-RU").replace(/\s/g, " ");

export const calculatePaymentSurchargeAmount = (
  basePrice: number,
  paymentMethod: PaymentMethodChoice,
): number =>
  paymentMethod === "card"
    ? calculatePaymentPriceBreakdown(basePrice).surchargeAmount
    : 0;

export const calculatePaymentMethodTotal = (
  basePrice: number,
  paymentMethod: PaymentMethodChoice,
): number =>
  paymentMethod === "card"
    ? calculatePaymentPriceBreakdown(basePrice).cardPrice
    : calculatePaymentPriceBreakdown(basePrice).cashPrice;
