import "server-only";
import { cache } from "react";
import { categoryApi, type CategoryTreeItem } from "@/shared/api";

export type CategoryBreadcrumb = {
  id: string;
  title: string;
  slug: string;
};

const getCategoryTree = cache(async (): Promise<CategoryTreeItem[]> => {
  try {
    return await categoryApi.getTree();
  } catch (error) {
    console.error("Failed to load category tree for breadcrumbs:", error);
    return [];
  }
});

function findCategoryPath(
  nodes: CategoryTreeItem[],
  categoryId: string,
  ancestors: CategoryBreadcrumb[] = [],
): CategoryBreadcrumb[] | null {
  for (const node of nodes) {
    const path = [
      ...ancestors,
      { id: node.id, title: node.title, slug: node.slug },
    ];

    if (node.id === categoryId) return path;

    const childPath = findCategoryPath(node.children || [], categoryId, path);
    if (childPath) return childPath;
  }

  return null;
}

export async function getCategoryBreadcrumbs(
  categoryId: string,
  fallback?: CategoryBreadcrumb,
): Promise<CategoryBreadcrumb[]> {
  const path = findCategoryPath(await getCategoryTree(), categoryId);
  return path || (fallback ? [fallback] : []);
}
