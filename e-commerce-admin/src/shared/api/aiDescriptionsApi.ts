import { apiClient } from "./client";

export interface AiDescriptionSettings {
  model: string;
  hasApiKey: boolean;
  apiKeyMasked: string;
}

export interface AiDescriptionDraft {
  id: string;
  productId: string;
  batchId?: string | null;
  text?: string | null;
  status: "PENDING" | "READY" | "NEEDS_REVIEW" | "ERROR" | "APPLIED";
  error?: string | null;
  productName?: string;
  currentDescription?: string | null;
  slug?: string;
  updatedAt?: string;
  appliedAt?: string | null;
}

export interface AiDescriptionBatch {
  id: string;
  status: "PROCESSING" | "COMPLETED";
  total: number;
  processed: number;
  success: number;
  failed: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export const aiDescriptionsApi = {
  getSettings: async (): Promise<AiDescriptionSettings> => {
    const { data } = await apiClient.get("/ai-descriptions/settings");
    return data;
  },
  saveSettings: async (payload: { apiKey?: string; model?: string }): Promise<AiDescriptionSettings> => {
    const { data } = await apiClient.put("/ai-descriptions/settings", payload);
    return data;
  },
  generateProduct: async (productId: string): Promise<AiDescriptionDraft> => {
    const { data } = await apiClient.post(`/ai-descriptions/products/${productId}/generate`);
    return data;
  },
  getProductDraft: async (productId: string): Promise<AiDescriptionDraft | null> => {
    const { data } = await apiClient.get(`/ai-descriptions/products/${productId}/draft`);
    return data;
  },
  applyProduct: async (productId: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post(`/ai-descriptions/products/${productId}/apply`);
    return data;
  },
  listDrafts: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const { data } = await apiClient.get("/ai-descriptions/drafts", { params });
    return data as { data: AiDescriptionDraft[]; meta: { page: number; limit: number; total: number } };
  },
  startBatch: async (): Promise<AiDescriptionBatch> => {
    const { data } = await apiClient.post("/ai-descriptions/batches");
    return data;
  },
  getLatestBatch: async (): Promise<AiDescriptionBatch | null> => {
    const { data } = await apiClient.get("/ai-descriptions/batches/latest");
    return data;
  },
  applyAll: async (): Promise<{ applied: number }> => {
    const { data } = await apiClient.post("/ai-descriptions/apply-all");
    return data;
  },
};
