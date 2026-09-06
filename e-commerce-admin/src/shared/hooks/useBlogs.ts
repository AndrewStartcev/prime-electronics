import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { toast } from "sonner";

interface Blog {
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

interface BlogsResponse {
  data: Blog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CreateBlogDto {
  title: string;
  text: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  author?: string;
  readTime?: string;
  tags?: string[];
  meta?: any;
  isActive?: boolean;
}

interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export function useBlogs({ page = 1, limit = 10 }) {
  return useQuery<BlogsResponse>({
    queryKey: ["blogs", "admin", page, limit],
    queryFn: async () => {
      const response = await api.get(`/blog/admin/all`, {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

export function useBlog(id: string) {
  return useQuery<Blog>({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await api.get(`/blog/admin/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBlogDto) => {
      const response = await api.post("/blog", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Статья успешно создана");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не удалось создать статью");
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBlogDto }) => {
      const response = await api.patch(`/blog/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
      toast.success("Статья успешно обновлена");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Не удалось обновить статью"
      );
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/blog/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Статья успешно удалена");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Не удалось удалить статью");
    },
  });
}
