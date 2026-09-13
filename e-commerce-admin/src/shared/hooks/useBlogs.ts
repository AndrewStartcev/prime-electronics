import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { toast } from "sonner";

export interface BlogAuthor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isActive: boolean;
  _count?: { posts: number };
}

export interface BlogProductBlockItem {
  productId: string;
  sortOrder?: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    images?: { url: string }[];
  };
}

export interface BlogProductBlock {
  id?: string;
  title?: string | null;
  placement?: "AFTER_ARTICLE" | "INLINE";
  sortOrder?: number;
  items: BlogProductBlockItem[];
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

interface BlogsResponse {
  data: Blog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBlogDto {
  title: string;
  text: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  author?: string;
  authorId?: string;
  readTime?: string;
  tags?: string[];
  meta?: any;
  isActive?: boolean;
  publishedAt?: string;
  productBlocks?: BlogProductBlock[];
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

export function useBlogAuthors() {
  return useQuery<BlogAuthor[]>({
    queryKey: ["blog-authors"],
    queryFn: async () => (await api.get("/blog-authors")).data,
  });
}

export function useCreateBlogAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<BlogAuthor, "id" | "_count">) =>
      (await api.post("/blog-authors", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      toast.success("Автор создан");
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || "Не удалось создать автора"),
  });
}

export function useUpdateBlogAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogAuthor> }) =>
      (await api.patch(`/blog-authors/${id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Автор обновлён");
    },
  });
}

export function useDeleteBlogAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/blog-authors/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Автор удалён");
    },
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
        error.response?.data?.message || "Не удалось обновить статью",
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
