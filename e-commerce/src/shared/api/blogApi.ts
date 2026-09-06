import { apiClient } from "./apiClient";

export interface Blog {
  id: string;
  title: string;
  text: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  author?: string;
  readTime?: string;
  tags?: string[];
  meta?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  // Get all blogs with pagination
  getBlogs: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<BlogsResponse> => {
    const { data } = await apiClient.get("/blog", { params });
    return data;
  },

  // Get blog by slug
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const { data } = await apiClient.get(`/blog/${slug}`);
    return data;
  },
};
