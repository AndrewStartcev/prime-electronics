export interface DashboardStat {
  value: number;
  change: number;
  changeType: "positive" | "negative";
}

export interface DashboardStats {
  revenue: DashboardStat;
  orders: DashboardStat;
  products: DashboardStat;
  users: DashboardStat;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  statusType: "success" | "warning" | "info" | "danger";
  createdAt: Date;
}

export interface ProductsImportError {
  row: number;
  reason: string;
}

export interface ProductsImportResult {
  fileName: string;
  sheetName: string;
  totalRows: number;
  processedRows: number;
  created: number;
  updated: number;
  skipped: number;
  categoriesChanged: number;
  categoriesPreserved: number;
  errors: ProductsImportError[];
  importBatchId?: string;
  undoAvailable?: boolean;
}

export interface ProductsImportUndoStatus {
  undoAvailable: boolean;
  batch: {
    id: string;
    fileName: string;
    createdAt: string;
    completedAt: string | null;
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
  } | null;
}

export interface ProductsImportUndoResult {
  batchId: string;
  restored: number;
  removed: number;
  removedCategories: number;
  removedBrands: number;
  skipped: number;
  status: "UNDONE" | "PARTIALLY_UNDONE";
}
