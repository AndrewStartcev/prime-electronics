export type ProductCartItemOptions = {
  variantKey?: string;
};

export function getProductCartActionKey(
  productId: string,
  options?: ProductCartItemOptions,
): string {
  return `${productId}::${options?.variantKey || ""}`;
}
