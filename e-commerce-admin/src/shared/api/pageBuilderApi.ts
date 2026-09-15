import { apiClient } from "./client";

export type StaticPageBlockType =
  | "hero"
  | "richText"
  | "imageText"
  | "cards"
  | "stats"
  | "steps"
  | "table"
  | "info"
  | "cta"
  | "map"
  | "contactForm"
  | "promotionGrid"
  | "productGrid";

export interface StaticPageBlock {
  type: StaticPageBlockType;
  version: number;
  data: Record<string, any>;
}

export interface StaticBuilderPage {
  id?: string | null;
  contentId?: string | null;
  path: string;
  name?: string | null;
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoH1?: string | null;
  isActive: boolean;
  blocks: StaticPageBlock[];
  updatedAt?: string | null;
}

export type UpsertStaticBuilderPageDto = Omit<
  StaticBuilderPage,
  "id" | "contentId" | "updatedAt"
>;

export const pageBuilderApi = {
  list: async (): Promise<StaticBuilderPage[]> => {
    const response = await apiClient.get("/seo/admin/pages");
    return response.data;
  },
  save: async (data: UpsertStaticBuilderPageDto): Promise<StaticBuilderPage> => {
    const response = await apiClient.post("/seo/admin/pages", data);
    return response.data;
  },
  remove: async (path: string): Promise<void> => {
    await apiClient.delete("/seo/admin/pages", { params: { path } });
  },
};
