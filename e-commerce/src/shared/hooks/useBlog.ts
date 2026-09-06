import { useQuery } from "@tanstack/react-query";
import { blogApi } from "../api/blogApi";

export function useBlogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => blogApi.getBlogs(params),
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ["blog", "slug", slug],
    queryFn: () => blogApi.getBlogBySlug(slug),
    enabled: !!slug,
  });
}

export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog", "slug", slug],
    queryFn: () => blogApi.getBlogBySlug(slug),
    enabled: !!slug,
  });
}
