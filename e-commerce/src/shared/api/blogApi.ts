import { apiClient } from "./apiClient";

export interface BlogAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface BlogProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  isOnSale?: boolean;
  createdAt?: string;
  images?: { url: string }[];
  attributes?: { name: string; value: string }[];
  productStock?: { stockCount: number }[];
}

export interface BlogProductBlock {
  id: string;
  title?: string | null;
  placement: "AFTER_ARTICLE" | "INLINE";
  sortOrder: number;
  items: Array<{ id: string; sortOrder: number; product: BlogProduct }>;
}

export interface Blog {
  id: string;
  title: string;
  text: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  author?: string;
  authorId?: string | null;
  authorProfile?: BlogAuthor | null;
  readTime?: string;
  tags?: string[];
  meta?: any;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  productBlocks?: BlogProductBlock[];
}

export interface BlogsResponse {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const blogApi = {
  getBlogs: async (params?: { page?: number; limit?: number }): Promise<BlogsResponse> => {
    const { data } = await apiClient.get("/blog", { params });
    return data;
  },
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const { data } = await apiClient.get(`/blog/${slug}`);
    return data;
  },
};
