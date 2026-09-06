export interface CartItem {
  id: string;
  title: string;
  variantLabel?: string | null;
  price: number;
  image: string;
  quantity: number;
}

export const mockCartItems: CartItem[] = [
  {
    id: "1",
    title: "Смартфон Apple iPhone 17 Pro 512Gb Cosmic Orange (1 sim + eSIM)",
    price: 129690,
    image: "/images/products/iphone-orange.png",
    quantity: 1,
  },
  {
    id: "2",
    title: "Смартфон Apple iPhone 17 Pro 512Gb Silver (1 sim + eSIM)",
    price: 129690,
    image: "/images/products/iphone-silver.png",
    quantity: 1,
  },
];
