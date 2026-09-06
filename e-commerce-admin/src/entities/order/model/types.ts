// Order entity types согласно ТЗ
export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  productImage?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  bonusUsed: number;
  bonusEarned?: number;
  bonusAccrualScheduledAt?: string | null;
  bonusAccrualAvailableAt?: string | null;
  bonusAccruedAt?: string | null;
  promoDiscount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  pickupPointId: string;
  pickupPoint?: PickupPoint;
  windowId: string;
  pickupWindow?: PickupWindow;
  comment?: string;
  cancelReason?: string;
  logs: OrderLog[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "PAYED"
  | "ASSEMBLED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "ROBOKASSA" | "CASH";

export type PaymentStatus = "PENDING" | "COMPLETED" | "REFUNDED";

export interface Payment {
  id: string;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details?: string;
  createdAt: string;
}

export interface PickupPoint {
  id: string;
  title: string;
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
  workingSchedule: WorkingSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingSchedule {
  dayOfWeek: number; // 0-6, 0 = Sunday
  timeFrom: string; // "09:00"
  timeTo: string; // "21:00"
  isWorking: boolean;
}

export interface PickupWindow {
  id: string;
  pointId: string;
  date: string; // "2025-12-07"
  timeFrom: string; // "10:00"
  timeTo: string; // "12:00"
  capacity: number;
  reservedCount: number;
  isActive: boolean;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Обрабатывается",
  PROCESSING: "Обрабатывается",
  CONFIRMED: "Подтвержден",
  PAYED: "Оплачен",
  ASSEMBLED: "Собран",
  SHIPPED: "Выехал",
  DELIVERED: "Выдан",
  CANCELLED: "Отменен",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  ROBOKASSA: "Онлайн оплата",
  CASH: "Наличными при получении",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Ожидает оплаты",
  COMPLETED: "Оплачен",
  REFUNDED: "Возврат",
};
