// Transaction entity types согласно ТЗ
export interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  paymentProvider: string;
  externalId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "payment" | "refund";

export type TransactionStatus = "pending" | "success" | "failed";

export const transactionTypeLabels: Record<TransactionType, string> = {
  payment: "Оплата",
  refund: "Возврат",
};

export const transactionStatusLabels: Record<TransactionStatus, string> = {
  pending: "В обработке",
  success: "Успешно",
  failed: "Ошибка",
};
