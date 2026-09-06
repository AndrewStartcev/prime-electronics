import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { seoApi } from "../api";
import type {
  SeoPageType,
  UpsertSeoCollectionDto,
  UpsertSeoTagTileDto,
  UpdateSeoTemplateDto,
  UpdateStaticPageSeoDto,
} from "../api";

export const seoKeys = {
  all: ["seo"] as const,
  templates: () => [...seoKeys.all, "templates"] as const,
  staticPages: () => [...seoKeys.all, "static-pages"] as const,
  robots: () => [...seoKeys.all, "robots"] as const,
  collections: () => [...seoKeys.all, "collections"] as const,
  tagTiles: () => [...seoKeys.all, "tag-tiles"] as const,
};

export function useSeoTemplates() {
  return useQuery({
    queryKey: seoKeys.templates(),
    queryFn: seoApi.getTemplates,
  });
}

export function useUpdateSeoTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: SeoPageType;
      data: UpdateSeoTemplateDto;
    }) => seoApi.updateTemplate(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.templates() });
    },
  });
}

export function useStaticPageSeoList() {
  return useQuery({
    queryKey: seoKeys.staticPages(),
    queryFn: seoApi.getStaticPages,
  });
}

export function useUpdateStaticPageSeo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStaticPageSeoDto) =>
      seoApi.updateStaticPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.staticPages() });
    },
  });
}

export function useRobots() {
  return useQuery({
    queryKey: seoKeys.robots(),
    queryFn: seoApi.getRobots,
  });
}

export function useUpdateRobots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seoApi.updateRobots,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.robots() });
    },
  });
}

export function useSeoCollections() {
  return useQuery({
    queryKey: seoKeys.collections(),
    queryFn: seoApi.getCollections,
  });
}

export function useCreateSeoCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertSeoCollectionDto) => seoApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.collections() });
    },
  });
}

export function useUpdateSeoCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpsertSeoCollectionDto }) =>
      seoApi.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.collections() });
      queryClient.invalidateQueries({ queryKey: seoKeys.tagTiles() });
    },
  });
}

export function useDeleteSeoCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seoApi.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.collections() });
      queryClient.invalidateQueries({ queryKey: seoKeys.tagTiles() });
    },
  });
}

export function useSeoTagTiles() {
  return useQuery({
    queryKey: seoKeys.tagTiles(),
    queryFn: seoApi.getTagTiles,
  });
}

export function useCreateSeoTagTile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertSeoTagTileDto) => seoApi.createTagTile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.tagTiles() });
    },
  });
}

export function useUpdateSeoTagTile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpsertSeoTagTileDto }) =>
      seoApi.updateTagTile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.tagTiles() });
    },
  });
}

export function useDeleteSeoTagTile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seoApi.deleteTagTile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.tagTiles() });
    },
  });
}
