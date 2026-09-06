export interface BasketItem {
  id: string;
  productId: string;
  productSlug?: string | null;
  title: string;
  variantLabel?: string | null;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  inStock: boolean;
}

export interface BasketSummary {
  subtotal: number;
  discount: number;
  total: number;
  cashback: number;
}
