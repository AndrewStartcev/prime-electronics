import type { Category, CategoryTree } from "@/shared/api";

export type CategoryOption = {
  id: string;
  title: string;
  slug: string;
  parentId?: string;
  parentTitle?: string;
  image?: string | null;
  depth: number;
  path: string[];
  label: string;
};

type FlattenOptions = {
  excludeIds?: Set<string>;
};

export function flattenCategoryTree(
  categories: CategoryTree[],
  options: FlattenOptions = {},
  depth = 0,
  parentPath: string[] = [],
): CategoryOption[] {
  return categories.flatMap((category) => {
    if (options.excludeIds?.has(category.id)) return [];

    const path = [...parentPath, category.title];
    const option: CategoryOption = {
      id: category.id,
      title: category.title,
      slug: category.slug,
      parentId: category.parentId,
      image: category.image,
      depth,
      path,
      label: path.join(" > "),
    };

    return [
      option,
      ...flattenCategoryTree(
        category.children || [],
        options,
        depth + 1,
        path,
      ),
    ];
  });
}

export function collectCategoryDescendantIds(
  categories: CategoryTree[],
  categoryId: string,
): Set<string> {
  const result = new Set<string>();

  const collect = (category: CategoryTree) => {
    result.add(category.id);
    (category.children || []).forEach(collect);
  };

  const walk = (nodes: CategoryTree[]): boolean => {
    for (const category of nodes) {
      if (category.id === categoryId) {
        collect(category);
        return true;
      }

      if (walk(category.children || [])) return true;
    }

    return false;
  };

  walk(categories);
  return result;
}

export function collectCategoryDescendantIdsFromList(
  categories: Category[],
  categoryId: string,
): Set<string> {
  const result = new Set<string>();
  const childrenByParentId = new Map<string, Category[]>();

  for (const category of categories) {
    if (!category.parentId) continue;

    const siblings = childrenByParentId.get(category.parentId) || [];
    siblings.push(category);
    childrenByParentId.set(category.parentId, siblings);
  }

  const collect = (parentId: string) => {
    const children = childrenByParentId.get(parentId) || [];
    for (const child of children) {
      result.add(child.id);
      collect(child.id);
    }
  };

  collect(categoryId);
  return result;
}

export function mergeCategoryOptionsWithList(
  treeOptions: CategoryOption[],
  categories: Category[],
  options: FlattenOptions = {},
): CategoryOption[] {
  const result = [...treeOptions];
  const knownIds = new Set(result.map((category) => category.id));

  const sortedCategories = [...categories].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;

    return a.title.localeCompare(b.title, "ru");
  });

  for (const category of sortedCategories) {
    if (knownIds.has(category.id) || options.excludeIds?.has(category.id)) {
      continue;
    }

    const parentTitle = category.parent?.title;
    const path = parentTitle
      ? [parentTitle, category.title]
      : [category.title];

    result.push({
      id: category.id,
      title: category.title,
      slug: category.slug,
      parentId: category.parentId,
      parentTitle,
      image: category.image,
      depth: parentTitle ? 1 : 0,
      path,
      label: path.join(" > "),
    });
    knownIds.add(category.id);
  }

  return result;
}

export function categoryOptionToSelectOption(category: CategoryOption) {
  const descriptionParts = [`/${category.slug}`];
  if (category.path.length === 1) {
    descriptionParts.push("главная категория");
  } else if (category.parentTitle) {
    descriptionParts.push(`родитель: ${category.parentTitle}`);
  }

  return {
    value: category.id,
    label: category.label,
    description: descriptionParts.join(" • "),
    image: category.image,
    keywords: [category.slug, category.title, ...category.path].join(" "),
  };
}
