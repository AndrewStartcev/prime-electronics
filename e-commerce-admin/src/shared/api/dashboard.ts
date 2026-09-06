import { apiClient } from "./client";
import type {
  ProductsImportResult,
  ProductsImportUndoResult,
  ProductsImportUndoStatus,
} from "@/shared/types/dashboard";
import type { AxiosResponse } from "axios";

// Dashboard API
export const dashboardApi = {
  async getStats() {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  async getRecentOrders() {
    const response = await apiClient.get("/admin/dashboard/recent-orders");
    return response.data;
  },

  async exportProductsXlsx(
    activity: "all" | "active" | "inactive" = "all",
    categoryId?: string,
    brandId?: string,
  ): Promise<AxiosResponse<Blob>> {
    return apiClient.get("/admin/dashboard/export/products-xlsx", {
      params: { activity, categoryId, brandId },
      responseType: "blob",
    });
  },

  async importProductsXlsx(file: File): Promise<ProductsImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/admin/dashboard/import/products-xlsx",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async getProductsImportUndoStatus(): Promise<ProductsImportUndoStatus> {
    const response = await apiClient.get(
      "/admin/dashboard/import/products-xlsx/undo-status",
    );
    return response.data;
  },

  async undoLatestProductsXlsxImport(): Promise<ProductsImportUndoResult> {
    const response = await apiClient.post(
      "/admin/dashboard/import/products-xlsx/undo",
    );
    return response.data;
  },
};
