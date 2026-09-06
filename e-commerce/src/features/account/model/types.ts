export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bonusBalance: number;
  tierName?: string;
  cashbackRate?: number;
}

export interface AccountTab {
  id: string;
  label: string;
  href: string;
}

export interface AccountCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: "favorites" | "orders" | "help";
  href: string;
  isActive?: boolean;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "CONFIRMED" | "PAYED" | "ASSEMBLED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  date: string;
  itemsCount: number;
  customerName: string;
  totalAmount: number;
}

export interface OrderProduct {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
}

export interface OrderDetail extends Order {
  time: string;
  address: string;
  deliveryCost: number;
  paymentMethod: string;
  bonusUsed: number;
  cashback: number;
  products: OrderProduct[];
}
