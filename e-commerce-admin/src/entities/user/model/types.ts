// User entity types согласно ТЗ
export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  bonusBalance: number;
  avatar?: string;
  addresses: UserAddress[];
  preferredPickupPointId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "manager" | "customer";

export interface UserAddress {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

export interface BonusTransaction {
  id: string;
  userId: string;
  orderId?: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export type Permission =
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "categories.view"
  | "categories.create"
  | "categories.edit"
  | "categories.delete"
  | "orders.view"
  | "orders.edit"
  | "orders.cancel"
  | "users.view"
  | "users.edit"
  | "users.block"
  | "users.bonus"
  | "pickup_points.view"
  | "pickup_points.edit"
  | "pickup_windows.view"
  | "pickup_windows.edit"
  | "coupons.view"
  | "coupons.edit"
  | "reviews.view"
  | "reviews.moderate"
  | "reports.view"
  | "settings.view"
  | "settings.edit"
  | "roles.manage";

export const userRoleLabels: Record<UserRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  customer: "Покупатель",
};

export const defaultRolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "categories.view",
    "categories.create",
    "categories.edit",
    "categories.delete",
    "orders.view",
    "orders.edit",
    "orders.cancel",
    "users.view",
    "users.edit",
    "users.block",
    "users.bonus",
    "pickup_points.view",
    "pickup_points.edit",
    "pickup_windows.view",
    "pickup_windows.edit",
    "coupons.view",
    "coupons.edit",
    "reviews.view",
    "reviews.moderate",
    "reports.view",
    "settings.view",
    "settings.edit",
    "roles.manage",
  ],
  manager: [
    "products.view",
    "categories.view",
    "orders.view",
    "orders.edit",
    "users.view",
    "pickup_points.view",
    "pickup_windows.view",
    "reviews.view",
    "reviews.moderate",
  ],
  customer: [],
};
