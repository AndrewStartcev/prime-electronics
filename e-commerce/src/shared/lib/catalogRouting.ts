import type { BrandResponse, CategoryTreeItem } from "@/shared/api";

export type CategoryCandidate = {
  key: string;
  label: string;
  slugs: string[];
  titleHints?: string[];
};

export type CategoryTarget = {
  key: string;
  label: string;
  options: CategoryTreeItem[];
};

type FlatCategoryNode = {
  node: CategoryTreeItem;
  depth: number;
  order: number;
};

export const HEADER_CATEGORY_CANDIDATES: CategoryCandidate[] = [
  { key: "apple", label: "Apple", slugs: ["apple"] },
  { key: "samsung", label: "Samsung", slugs: ["samsung"] },
  { key: "xiaomi", label: "Xiaomi", slugs: ["xiaomi"] },
  {
    key: "laptops",
    label: "Ноутбуки",
    slugs: ["noutbuki", "noutbuki-apple"],
    titleHints: ["ноутбук", "macbook"],
  },
  {
    key: "watches",
    label: "Часы",
    slugs: [
      "umnye-chasy",
      "chasy",
      "chasy-1",
      "chasy-2",
      "umnye-chasy-samsung",
      "chasy-apple-watch",
    ],
    titleHints: ["часы", "watch"],
  },
  {
    key: "headphones",
    label: "Наушники",
    slugs: [
      "naushniki",
      "naushniki-1",
      "naushniki-2",
      "naushniki-3",
      "naushniki-samsung",
      "naushniki-apple-airpods-i-beats",
    ],
    titleHints: ["наушники", "airpods", "buds"],
  },
  {
    key: "playstation",
    label: "PlayStation",
    slugs: [
      "pristavki-1",
      "playstation-5-pro",
      "playstation-5-slim",
      "playstation-portal",
      "igrovye-pristavki",
      "igrovye-konsoli-i-tv-pristavki",
    ],
    titleHints: ["playstation", "ps", "sony"],
  },
  {
    key: "accessories",
    label: "Аксессуары",
    slugs: [
      "aksessuary",
      "aksessuary-1",
      "aksessuary-2",
      "aksessuary-apple",
      "aksessuay",
      "aksessuary-dlya-iphone",
      "aksessuary-dlya-android",
    ],
    titleHints: ["аксессуар", "кабель", "чехол"],
  },
];

export const FOOTER_CATEGORY_CANDIDATES: CategoryCandidate[] = [
  {
    key: "phones",
    label: "Смартфоны",
    slugs: [
      "smartfony",
      "telefony",
      "telefony-1",
      "telefony-2",
      "telefony-3",
      "telefony-5",
      "smartfony-apple-iphone",
      "smartfony-samsung",
      "smartfony-xiaomi",
      "smartfony-google-pixel",
      "smartfony-oneplus",
      "smartfony-honor",
    ],
    titleHints: ["телефон", "смартфон", "iphone"],
  },
  {
    key: "laptops",
    label: "Ноутбуки",
    slugs: ["noutbuki", "noutbuki-apple"],
    titleHints: ["ноутбук", "macbook"],
  },
  {
    key: "watches",
    label: "Часы",
    slugs: [
      "umnye-chasy",
      "chasy",
      "chasy-1",
      "chasy-2",
      "umnye-chasy-samsung",
      "chasy-apple-watch",
    ],
    titleHints: ["часы", "watch"],
  },
  {
    key: "headphones",
    label: "Наушники",
    slugs: [
      "naushniki",
      "naushniki-1",
      "naushniki-2",
      "naushniki-3",
      "naushniki-samsung",
      "naushniki-apple-airpods-i-beats",
    ],
    titleHints: ["наушники", "airpods", "buds"],
  },
  {
    key: "tablets",
    label: "Планшеты",
    slugs: [
      "planshety",
      "planshety-1",
      "planshety-3",
      "planshety-samsung",
      "planshety-apple-ipad",
      "planshety-xiaomi",
    ],
    titleHints: ["планшет", "ipad", "tab"],
  },
  {
    key: "accessories",
    label: "Аксессуары",
    slugs: [
      "aksessuary",
      "aksessuary-1",
      "aksessuary-2",
      "aksessuary-apple",
      "aksessuay",
      "aksessuary-dlya-iphone",
      "aksessuary-dlya-android",
    ],
    titleHints: ["аксессуар", "кабель", "чехол"],
  },
  {
    key: "consoles",
    label: "Приставки",
    slugs: [
      "pristavki",
      "pristavki-1",
      "igrovye-pristavki",
      "igrovye-konsoli-i-tv-pristavki",
    ],
    titleHints: ["приставк", "playstation", "консол"],
  },
];

export const FOOTER_SUBCATEGORY_CANDIDATES: CategoryCandidate[] = [
  {
    key: "apple-phones",
    label: "Телефоны Apple",
    slugs: ["telefony", "smartfony-apple-iphone"],
    titleHints: ["iphone", "apple"],
  },
  {
    key: "samsung-phones",
    label: "Телефоны Samsung",
    slugs: ["telefony-1", "smartfony-samsung"],
    titleHints: ["samsung", "galaxy"],
  },
  {
    key: "apple-tablets",
    label: "Планшеты Apple",
    slugs: ["planshety-1", "planshety-apple-ipad"],
    titleHints: ["ipad", "apple"],
  },
  {
    key: "samsung-tablets",
    label: "Планшеты Samsung",
    slugs: ["planshety-samsung", "planshety-3"],
    titleHints: ["samsung", "tab"],
  },
  {
    key: "apple-watches",
    label: "Часы Apple",
    slugs: ["chasy-1", "chasy-apple-watch"],
    titleHints: ["apple", "watch"],
  },
  {
    key: "samsung-watches",
    label: "Часы Samsung",
    slugs: ["chasy-2", "umnye-chasy-samsung"],
    titleHints: ["samsung", "watch"],
  },
  {
    key: "dji-stabilizers",
    label: "DJI Стабилизаторы",
    slugs: ["stabilizatory"],
    titleHints: ["dji", "стабилиз"],
  },
  {
    key: "yandex-stations",
    label: "Яндекс Станции",
    slugs: ["stantsii"],
    titleHints: ["яндекс", "станц"],
  },
];

export const BRAND_SLUG_WHITELIST = new Set([
  "apple",
  "beats",
  "dji",
  "dyson",
  "garmin",
  "honor",
  "insta360",
  "jbl",
  "marshall",
  "nintendo",
  "oneplus",
  "pixel",
  "rayban",
  "samsung",
  "sony",
  "whoop",
  "xiaomi",
  "yandeks",
]);

const BRAND_TITLE_WHITELIST = new Set([
  "apple",
  "beats",
  "dji",
  "dyson",
  "garmin",
  "honor",
  "insta360",
  "jbl",
  "marshall",
  "nintendo",
  "oneplus",
  "pixel",
  "rayban",
  "samsung",
  "sony",
  "whoop",
  "xiaomi",
  "яндекс",
  "yandex",
]);

export const normalizeSlug = (slug: string): string =>
  slug
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const CATEGORY_SLUGS_WITHOUT_BRAND_CONTEXT = new Set([
  "aksessuary-1",
  "naushniki",
]);
const DETACHED_BRAND_CHILD_SLUGS_BY_PARENT_SLUG: Record<string, Set<string>> = {
};

export const shouldKeepBrandContextForCategorySlug = (
  slug?: string | null,
): boolean => {
  if (!slug) return false;

  return !CATEGORY_SLUGS_WITHOUT_BRAND_CONTEXT.has(normalizeSlug(slug));
};

export const shouldShowBrandChildCategory = (
  parentSlug?: string | null,
  childSlug?: string | null,
): boolean => {
  if (!parentSlug || !childSlug) return true;

  const detachedChildren =
    DETACHED_BRAND_CHILD_SLUGS_BY_PARENT_SLUG[normalizeSlug(parentSlug)];
  if (!detachedChildren) return true;

  return !detachedChildren.has(normalizeSlug(childSlug));
};

const normalizeLookupKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]+/gi, "");

const flattenCategoryTree = (
  tree: CategoryTreeItem[] | undefined,
): FlatCategoryNode[] => {
  if (!tree || tree.length === 0) return [];

  const result: FlatCategoryNode[] = [];
  let order = 0;

  const walk = (nodes: CategoryTreeItem[], depth: number) => {
    nodes.forEach((node) => {
      result.push({ node, depth, order });
      order += 1;

      if (node.children && node.children.length > 0) {
        walk(node.children, depth + 1);
      }
    });
  };

  walk(tree, 0);
  return result;
};

const pushUniqueOption = (
  options: FlatCategoryNode[],
  seen: Set<string>,
  candidate: FlatCategoryNode,
) => {
  if (seen.has(candidate.node.id)) return;
  seen.add(candidate.node.id);
  options.push(candidate);
};

export const resolveCategoryTargets = (
  tree: CategoryTreeItem[] | undefined,
  candidates: CategoryCandidate[],
): CategoryTarget[] => {
  if (!tree || tree.length === 0) {
    return candidates.map((candidate) => ({
      key: candidate.key,
      label: candidate.label,
      options: [],
    }));
  }

  const flatNodes = flattenCategoryTree(tree);
  const slugIndex = new Map<string, FlatCategoryNode[]>();

  flatNodes.forEach((flatNode) => {
    const key = normalizeSlug(flatNode.node.slug);
    if (!key) return;

    const list = slugIndex.get(key) || [];
    list.push(flatNode);
    slugIndex.set(key, list);
  });

  return candidates.map((candidate) => {
    const options: FlatCategoryNode[] = [];
    const seen = new Set<string>();

    candidate.slugs.forEach((slug) => {
      const normalized = normalizeSlug(slug);
      if (!normalized) return;

      const matches = slugIndex.get(normalized) || [];
      matches.forEach((match) => pushUniqueOption(options, seen, match));
    });

    if (options.length === 0 && candidate.titleHints?.length) {
      const hintKeys = candidate.titleHints
        .map(normalizeLookupKey)
        .filter(Boolean);

      flatNodes.forEach((flatNode) => {
        const titleKey = normalizeLookupKey(flatNode.node.title);
        if (!titleKey) return;

        const matched = hintKeys.some((hint) => titleKey.includes(hint));
        if (matched) {
          pushUniqueOption(options, seen, flatNode);
        }
      });
    }

    options.sort((a, b) => a.depth - b.depth || a.order - b.order);

    return {
      key: candidate.key,
      label: candidate.label,
      options: options.map((item) => item.node),
    };
  });
};

export const getUniqueTargetOptions = (
  targets: CategoryTarget[],
): CategoryTreeItem[] => {
  const deduped = new Map<string, CategoryTreeItem>();

  targets.forEach((target) => {
    target.options.forEach((option) => {
      if (!deduped.has(option.id)) {
        deduped.set(option.id, option);
      }
    });
  });

  return Array.from(deduped.values());
};

export const pickBestCategoryOption = (
  target: CategoryTarget,
  totalsByCategoryId: ReadonlyMap<string, number>,
): CategoryTreeItem | null => {
  let best: { node: CategoryTreeItem; total: number } | null = null;

  for (const option of target.options) {
    const total = totalsByCategoryId.get(option.id) ?? 0;
    if (total <= 0) continue;

    if (!best || total > best.total) {
      best = { node: option, total };
    }
  }

  return best ? best.node : null;
};

export const resolveBrandCategoryNode = (
  tree: CategoryTreeItem[] | undefined,
  brand: Pick<BrandResponse, "name" | "slug">,
): CategoryTreeItem | null => {
  if (!tree || tree.length === 0) return null;

  const brandSlugKey = normalizeSlug(brand.slug || "");
  const brandNameKey = normalizeLookupKey(brand.name || "");

  if (!brandSlugKey && !brandNameKey) return null;

  const rootBySlug = tree.find(
    (node) => normalizeSlug(node.slug) === brandSlugKey,
  );
  if (rootBySlug) return rootBySlug;

  const rootByTitle = tree.find(
    (node) => normalizeLookupKey(node.title) === brandNameKey,
  );
  if (rootByTitle) return rootByTitle;

  const flatNodes = flattenCategoryTree(tree).filter(
    ({ node }) =>
      normalizeSlug(node.slug) === brandSlugKey ||
      normalizeLookupKey(node.title) === brandNameKey,
  );

  if (flatNodes.length === 0) return null;

  flatNodes.sort(
    (a, b) =>
      a.depth - b.depth ||
      b.node.children.length - a.node.children.length ||
      a.order - b.order,
  );

  return flatNodes[0].node;
};

export const isBrandCategoryNode = (
  category: Pick<CategoryTreeItem, "title" | "slug">,
): boolean => {
  const slugKey = normalizeSlug(category.slug || "");
  if (BRAND_SLUG_WHITELIST.has(slugKey)) return true;

  const titleKey = normalizeLookupKey(category.title || "");
  return BRAND_TITLE_WHITELIST.has(titleKey);
};

export const filterValidBrands = (
  brands: BrandResponse[] | undefined,
): BrandResponse[] => {
  if (!brands || brands.length === 0) return [];

  const deduped = new Map<string, BrandResponse>();

  brands.forEach((brand) => {
    const normalizedSlug = normalizeSlug(brand.slug || "");
    const normalizedName = normalizeLookupKey(brand.name || "");
    const count = brand._count?.products ?? 0;

    if (count <= 0) return;

    const slugKey =
      normalizedSlug ||
      (BRAND_TITLE_WHITELIST.has(normalizedName)
        ? normalizeSlug(brand.name)
        : "");

    if (!slugKey || !BRAND_SLUG_WHITELIST.has(slugKey)) return;

    const existing = deduped.get(slugKey);
    const existingCount = existing?._count?.products ?? 0;

    if (!existing || count > existingCount) {
      deduped.set(slugKey, {
        ...brand,
        slug: slugKey,
        name: brand.name.trim(),
      });
    }
  });

  return Array.from(deduped.values()).sort(
    (a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0),
  );
};
