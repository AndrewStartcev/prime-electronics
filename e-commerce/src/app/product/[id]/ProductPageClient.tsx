"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCategoryTree, useProductById } from "@/shared/hooks";
import { Breadcrumb } from "@/shared/ui";
import {
  ProductGallery,
  ProductInfo,
  ProductTabs,
  RelatedProducts,
} from "@/entities/product";
import { useProducts } from "@/shared/hooks";
import { productApi, type CategoryTreeItem } from "@/shared/api";
import { getSimEsimDisplay } from "@/entities/product/lib/simEsim";
import {
  buildProductSpecifications,
  shouldUsePhoneVariants,
} from "@/entities/product/lib/specifications";
import {
  buildProductVariantConfigurations,
  findProductVariantConfigurationBySelection,
  isVariantConfigurationAttributeName,
  normalizeVariantOption,
  type ProductVariantSelection,
} from "@/entities/product/lib/variantConfigurations";
import {
  sortColorOptions,
  sortSimOptions,
  sortStorageOptions,
} from "@/entities/product/lib/variantOptions";
import { getProductUrl } from "@/shared/lib/productUrl";
import { resolveProductDocumentTitle } from "@/shared/lib/seo";
import type {
  ProductDetailResponse,
  ProductResponse,
  ProductVariantGroupProductResponse,
} from "@/shared/api/productApi";
import type {
  ProductModificationOption,
  ProductVariantConfiguration,
} from "@/entities/product/model";

type ProductAttribute = {
  name: string;
  value: string;
};

type ProductCategoryEntry = {
  categoryId: string;
  isPrimary: boolean;
  category: { id: string; title: string; slug: string };
};

type BreadcrumbCategory = {
  id: string;
  title: string;
  slug: string;
};

type CategoryTreeMeta = {
  node: CategoryTreeItem;
  parentId: string | null;
  depth: number;
};

function getPrimaryCategory(
  categories: ProductCategoryEntry[],
) {
  const primary = categories.find((c) => c.isPrimary) || categories[0];
  return primary?.category || null;
}

const UTILITY_CATEGORY_SLUGS = new Set(["vygodnye-predlozheniya"]);
const UTILITY_CATEGORY_TITLES = new Set(["выгодные предложения"]);

function normalizeCategoryText(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").trim();
}

function normalizeCategorySearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUtilityCategory(category: BreadcrumbCategory): boolean {
  const slug = normalizeCategoryText(category.slug);
  const title = normalizeCategoryText(category.title);

  return (
    UTILITY_CATEGORY_TITLES.has(title) ||
    Array.from(UTILITY_CATEGORY_SLUGS).some((utilitySlug) =>
      slug === utilitySlug || slug.startsWith(`${utilitySlug}-`),
    )
  );
}

function buildCategoryTreeMeta(tree: CategoryTreeItem[]): Map<string, CategoryTreeMeta> {
  const meta = new Map<string, CategoryTreeMeta>();

  const walk = (
    nodes: CategoryTreeItem[],
    parentId: string | null,
    depth: number,
  ) => {
    nodes.forEach((node) => {
      meta.set(node.id, { node, parentId, depth });

      if (node.children?.length) {
        walk(node.children, node.id, depth + 1);
      }
    });
  };

  walk(tree, null, 0);
  return meta;
}

function getCategoryPath(
  categoryId: string,
  meta: Map<string, CategoryTreeMeta>,
): BreadcrumbCategory[] {
  const path: BreadcrumbCategory[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const current = meta.get(currentId);
    if (!current) break;

    path.unshift({
      id: current.node.id,
      title: current.node.title,
      slug: current.node.slug,
    });
    currentId = current.parentId;
  }

  return path;
}

function findCategoryBySlug(
  tree: CategoryTreeItem[] | undefined,
  slugs: string[],
): CategoryTreeItem | null {
  if (!tree?.length) return null;
  const slugSet = new Set(slugs);

  const walk = (nodes: CategoryTreeItem[]): CategoryTreeItem | null => {
    for (const node of nodes) {
      if (slugSet.has(node.slug)) return node;
      const child = walk(node.children || []);
      if (child) return child;
    }

    return null;
  };

  return walk(tree);
}

function getSeriesMatchKeys(category: BreadcrumbCategory): string[] {
  const values = [
    category.title,
    category.slug.replace(/-/g, " "),
  ];
  const keys = new Set<string>();

  values.forEach((value) => {
    const normalized = normalizeCategorySearchText(value);
    if (!normalized) return;

    keys.add(normalized);
    keys.add(
      normalized
        .replace(/\bсерия\b/g, "")
        .replace(/\bseries\b/g, "")
        .replace(/\bseriya\b/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    );
  });

  return Array.from(keys)
    .filter((key) => key.length >= 6)
    .sort((a, b) => b.length - a.length);
}

function getProductCategorySearchText(
  productName: string | undefined,
  attributes: ProductAttribute[] | undefined,
): string {
  const values = [productName || ""];

  attributes?.forEach((attribute) => {
    values.push(attribute.name, attribute.value);
  });

  return normalizeCategorySearchText(values.join(" "));
}

function inferChildBreadcrumbCategory(
  parentCategory: BreadcrumbCategory,
  meta: Map<string, CategoryTreeMeta>,
  productSearchText: string,
): BreadcrumbCategory | null {
  if (!productSearchText) return null;

  const parent = meta.get(parentCategory.id);
  const children = parent?.node.children || [];

  return (
    children
      .map((child) => ({
        id: child.id,
        title: child.title,
        slug: child.slug,
      }))
      .find((child) =>
        getSeriesMatchKeys(child).some((key) =>
          productSearchText.includes(key),
        ),
      ) || null
  );
}

function getBreadcrumbCategories(
  categories: ProductCategoryEntry[],
  categoryTree: CategoryTreeItem[] | undefined,
  productName?: string,
  attributes?: ProductAttribute[],
): BreadcrumbCategory[] {
  const visibleCategories = categories
    .map(({ category }) => category)
    .filter((category) => !isUtilityCategory(category));

  if (visibleCategories.length === 0) return [];

  if (!categoryTree?.length) {
    const seen = new Set<string>();
    return visibleCategories.filter((category) => {
      if (seen.has(category.id)) return false;
      seen.add(category.id);
      return true;
    });
  }

  const meta = buildCategoryTreeMeta(categoryTree);
  const deepestAssignedCategory = visibleCategories
    .map((category, index) => ({
      category,
      index,
      depth: meta.get(category.id)?.depth ?? 0,
    }))
    .sort((a, b) => b.depth - a.depth || a.index - b.index)[0]?.category;

  if (!deepestAssignedCategory) return [];

  const path = getCategoryPath(deepestAssignedCategory.id, meta);
  if (path.length === 0) return visibleCategories;

  const visiblePath = path.filter((category) => !isUtilityCategory(category));
  const lastCategory = visiblePath[visiblePath.length - 1];

  if (!lastCategory) return visiblePath;

  const inferredChild = inferChildBreadcrumbCategory(
    lastCategory,
    meta,
    getProductCategorySearchText(productName, attributes),
  );

  if (
    inferredChild &&
    !visiblePath.some((category) => category.id === inferredChild.id)
  ) {
    return [...visiblePath, inferredChild];
  }

  return visiblePath;
}

const COLOR_NAMES = ["цвет", "color"];
const STORAGE_NAMES = ["память", "storage", "встроенная память", "объем памяти"];
const SIM_NAMES = ["sim", "sim-карт", "сим", "количество sim"];
const ESIM_NAMES = ["esim", "e-sim", "e sim", "eсим", "еsim", "е-sim", "е sim", "есим"];
const MODIFICATION_NAMES = ["модификация", "modification"];
const NEW_PRODUCT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const NOW_TIMESTAMP = Date.now();

type ProductModificationData = {
  options: Omit<ProductModificationOption, "isCurrent">[];
  detailsById: Record<string, ProductDetailResponse>;
};

type SelectedLinkedVariant = {
  id: string;
  sourceProductId: string;
  selection: ProductVariantSelection;
};

const EMPTY_MODIFICATION_DATA: ProductModificationData = {
  options: [],
  detailsById: {},
};
const EMPTY_PRODUCT_DETAILS_BY_ID: Record<string, ProductDetailResponse> = {};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").trim();
}

function splitValues(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.includes(",") || trimmed.includes(";") || trimmed.includes("|")) {
    return trimmed
      .split(/[;,|]/g)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

function isMatch(name: string, terms: string[]): boolean {
  const normalized = normalizeText(name);
  return terms.some((term) => normalized.includes(term));
}

function isExactMatch(name: string, terms: string[]): boolean {
  const normalized = normalizeText(name);
  return terms.some((term) => normalized === normalizeText(term));
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const key = normalizeVariantOption(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(value.trim());
  });

  return result;
}

function getPreferredProductConfiguration(
  configurations: ProductVariantConfiguration[],
  productId: string,
  productPrice: number,
): ProductVariantConfiguration | undefined {
  const productConfigurations = configurations.filter(
    (config) => config.linkedProductId === productId,
  );

  return (
    productConfigurations.find(
      (config) =>
        Number.isFinite(productPrice) &&
        Math.abs(config.price - productPrice) < 0.01,
    ) || productConfigurations[0]
  );
}

function getValuesByNames(
  attributes: ProductAttribute[],
  names: string[],
  options?: { exact?: boolean },
): string[] {
  const values: string[] = [];

  attributes.forEach((attribute) => {
    const matched = options?.exact
      ? isExactMatch(attribute.name, names)
      : isMatch(attribute.name, names);
    if (!matched) return;
    values.push(...splitValues(attribute.value));
  });

  return unique(values);
}

function getModificationValue(attributes: ProductAttribute[]): string {
  return getValuesByNames(attributes, MODIFICATION_NAMES)[0] || "";
}

function getModificationSortOrder(value: string): number {
  const normalized = normalizeText(value);
  const compact = normalized.replace(/\s+/g, "");

  if (normalized.includes("nano") && normalized.includes("esim")) return 0;
  if (/2.*(nano|sim|сим)/i.test(normalized) || compact.includes("2sim")) return 1;
  if (compact.includes("esim") || compact.includes("есим")) return 2;

  return 10;
}

async function getProductModificationOptions(
  product: ProductDetailResponse,
): Promise<ProductModificationData> {
  const products = await productApi.getAll({
    search: product.name,
    limit: 200,
  });
  const productNameKey = normalizeText(product.name);
  const candidates = products.data.filter(
    (candidate) => normalizeText(candidate.name) === productNameKey,
  );

  if (candidates.length <= 1) {
    return EMPTY_MODIFICATION_DATA;
  }

  const details = await Promise.all(
    candidates.map(async (candidate) => {
      if (candidate.id === product.id) return product;

      try {
        return await productApi.getById(candidate.id);
      } catch {
        return null;
      }
    }),
  );

  const byModification = new Map<string, Omit<ProductModificationOption, "isCurrent">>();
  const detailsById: Record<string, ProductDetailResponse> = {};

  details.forEach((detail) => {
    if (!detail) return;

    detailsById[detail.id] = detail;

    const label = getModificationValue(detail.attributes || []);
    if (!label) return;

    const option: Omit<ProductModificationOption, "isCurrent"> = {
      id: detail.id,
      label,
      price: parseFloat(detail.price),
      oldPrice: detail.oldPrice ? parseFloat(detail.oldPrice) : undefined,
    };
    const key = normalizeText(label);
    const existing = byModification.get(key);

    if (
      !existing ||
      detail.id === product.id ||
      (existing.id !== product.id && option.price < existing.price)
    ) {
      byModification.set(key, option);
    }
  });

  return {
    options: Array.from(byModification.values()).sort(
      (a, b) =>
        getModificationSortOrder(a.label) - getModificationSortOrder(b.label) ||
        a.price - b.price,
    ),
    detailsById,
  };
}

function isOptionAttribute(name: string): boolean {
  return (
    isExactMatch(name, COLOR_NAMES) ||
    isMatch(name, STORAGE_NAMES) ||
    isMatch(name, SIM_NAMES) ||
    isMatch(name, ESIM_NAMES) ||
    isMatch(name, MODIFICATION_NAMES) ||
    isVariantConfigurationAttributeName(name)
  );
}

function productResponseToCard(product: ProductResponse) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description?.trim() || undefined,
    price: parseFloat(product.price),
    images:
      product.images && product.images.length > 0
        ? product.images.map((img) => img.url)
        : ["/images/placeholder-product.png"],
    inStock: product.totalStock > 0,
    isNew:
      new Date(product.createdAt) >
      new Date(NOW_TIMESTAMP - NEW_PRODUCT_WINDOW_MS),
    isSale: product.isOnSale,
    isFavorite: false,
  };
}

function manualRelatedProductToCard(
  product: NonNullable<ProductDetailResponse["relatedProducts"]>[number]["targetProduct"],
) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description?.trim() || undefined,
    price: parseFloat(product.price),
    images:
      product.images.length > 0
        ? product.images.map((image) => image.url)
        : ["/images/placeholder-product.png"],
    inStock: product.totalStock > 0,
    isNew:
      new Date(product.createdAt) >
      new Date(NOW_TIMESTAMP - NEW_PRODUCT_WINDOW_MS),
    isSale: product.isOnSale,
    isFavorite: false,
  };
}

function productVariantToDetailResponse(
  baseProduct: ProductDetailResponse,
  variant: ProductVariantGroupProductResponse,
): ProductDetailResponse {
  return {
    ...baseProduct,
    id: variant.id,
    name: variant.name,
    slug: variant.slug,
    price: variant.price,
    oldPrice: variant.oldPrice,
    seoTitle: "",
    seoH1: variant.name,
    isActive: variant.isActive,
    variantColor: variant.variantColor,
    variantMemory: variant.variantMemory,
    variantSim: variant.variantSim,
    images: variant.images?.length ? variant.images : baseProduct.images,
    attributes: variant.attributes?.length
      ? variant.attributes
      : baseProduct.attributes,
    totalStock: variant.totalStock,
  };
}

export default function ProductPageClient({
  id,
  initialProduct,
  initialSeoH1,
  productTitleTemplate,
}: {
  id: string;
  initialProduct?: ProductDetailResponse;
  initialSeoH1?: string;
  productTitleTemplate?: string | null;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollToTop();
    const animationFrameId = window.requestAnimationFrame(scrollToTop);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [id]);

  const [selectedModification, setSelectedModification] = useState<{
    id: string;
    sourceProductId: string;
  } | null>(null);
  const [selectedLinkedVariant, setSelectedLinkedVariant] =
    useState<SelectedLinkedVariant | null>(null);
  const { data: productData, isLoading, error } = useProductById(
    id,
    initialProduct,
  );
  const { data: categoryTree } = useCategoryTree();

  const primaryCategory = productData
    ? getPrimaryCategory(productData.categories || [])
    : null;
  const primaryCategoryId = primaryCategory?.id;

  const { data: relatedProductsData } = useProducts(
    primaryCategoryId
      ? { categoryId: primaryCategoryId, limit: 10, page: 1 }
      : {},
  );
  const accessoriesCategory = useMemo(
    () => findCategoryBySlug(categoryTree, ["aksessuary-1", "aksessuary"]),
    [categoryTree],
  );
  const { data: accessoriesProductsData } = useProducts(
    accessoriesCategory?.id && productData
      ? {
          categoryId: accessoriesCategory.id,
          brandIds: productData.brandId ? [productData.brandId] : undefined,
          limit: 6,
          page: 1,
          sortBy: "popularity",
        }
      : { page: 1, limit: 0 },
  );
  const initialPhoneVariantsEnabled = productData
    ? shouldUsePhoneVariants({
        name: productData.name,
        categories: productData.categories || [],
      })
    : false;
  const { data: modificationData = EMPTY_MODIFICATION_DATA } =
    useQuery<ProductModificationData>({
      queryKey: ["products", "modifications", productData?.id],
      queryFn: () => getProductModificationOptions(productData!),
      enabled: Boolean(productData && initialPhoneVariantsEnabled),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const baseVariantProducts = useMemo(
    () =>
      productData?.variantGroup?.products?.filter((variant) => variant.isActive) ||
      [],
    [productData],
  );
  const baseVariantProductIds = useMemo(
    () => baseVariantProducts.map((variant) => variant.id).join(","),
    [baseVariantProducts],
  );
  const fallbackVariantDetailsById = useMemo(() => {
    if (!productData) return EMPTY_PRODUCT_DETAILS_BY_ID;

    return baseVariantProducts.reduce<Record<string, ProductDetailResponse>>(
      (acc, variant) => {
        acc[variant.id] =
          variant.id === productData.id
            ? productData
            : productVariantToDetailResponse(productData, variant);
        return acc;
      },
      {},
    );
  }, [baseVariantProducts, productData]);
  const { data: variantDetailsById = EMPTY_PRODUCT_DETAILS_BY_ID } = useQuery<
    Record<string, ProductDetailResponse>
  >({
    queryKey: [
      "products",
      "variant-group-details",
      productData?.variantGroup?.id,
      baseVariantProductIds,
    ],
    queryFn: async () => {
      if (!productData) return EMPTY_PRODUCT_DETAILS_BY_ID;

      const details = await Promise.all(
        baseVariantProducts.map(async (variant) => {
          if (variant.id === productData.id) return productData;

          try {
            return await productApi.getById(variant.id);
          } catch {
            return productVariantToDetailResponse(productData, variant);
          }
        }),
      );

      return details.reduce<Record<string, ProductDetailResponse>>((acc, detail) => {
        acc[detail.id] = detail;
        return acc;
      }, {});
    },
    enabled: Boolean(productData && baseVariantProducts.length > 1),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const activeProductData = useMemo(() => {
    if (!productData) return null;
    if (selectedLinkedVariant?.sourceProductId === productData.id) {
      return (
        variantDetailsById[selectedLinkedVariant.id] ||
        fallbackVariantDetailsById[selectedLinkedVariant.id] ||
        productData
      );
    }

    if (selectedModification?.sourceProductId !== productData.id) {
      return productData;
    }

    return modificationData.detailsById[selectedModification.id] || productData;
  }, [
    modificationData.detailsById,
    fallbackVariantDetailsById,
    productData,
    selectedModification?.id,
    selectedModification?.sourceProductId,
    selectedLinkedVariant?.id,
    selectedLinkedVariant?.sourceProductId,
    variantDetailsById,
  ]);
  const activeVariantProducts = useMemo(() => {
    const activeGroupProducts =
      (activeProductData ?? productData)?.variantGroup?.products?.filter(
        (variant) => variant.isActive,
      ) || [];

    return activeGroupProducts.length > 1
      ? activeGroupProducts
      : baseVariantProducts;
  }, [activeProductData, baseVariantProducts, productData]);

  useEffect(() => {
    if (!activeProductData) return;

    document.title = resolveProductDocumentTitle({
      name: activeProductData.name,
      price: activeProductData.price,
      seoTitle: activeProductData.seoTitle,
      titleTemplate: productTitleTemplate,
    });
  }, [activeProductData, productTitleTemplate]);

  const handleModificationSelect = useCallback(
    (optionId: string) => {
      if (!productData || activeProductData?.id === optionId) return;
      if (!modificationData.detailsById[optionId]) return;

      setSelectedLinkedVariant(null);
      setSelectedModification({
        id: optionId,
        sourceProductId: productData.id,
      });

      const selectedProduct = modificationData.detailsById[optionId];
      window.history.pushState(null, "", getProductUrl(selectedProduct));
    },
    [activeProductData?.id, modificationData.detailsById, productData],
  );
  const handleLinkedVariantSelect = useCallback(
    (productId: string, selection: ProductVariantSelection) => {
      if (!productData || activeProductData?.id === productId) return;

      const linkedProduct = activeVariantProducts.find(
        (variant) => variant.id === productId,
      );
      const nextUrl = getProductUrl(linkedProduct || { id: productId });

      setSelectedModification(null);
      setSelectedLinkedVariant({
        id: productId,
        sourceProductId: productData.id,
        selection,
      });
      window.history.pushState(null, "", nextUrl);
    },
    [activeProductData?.id, activeVariantProducts, productData],
  );

  if (isLoading) {
    return (
      <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[16px] md:py-[20px] lg:py-[30px] xl:py-[40px] 2xl:py-[50px] 3xl:py-[60px]">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-1/3 bg-gray-200 rounded" />
          <div className="flex flex-col lg:flex-row gap-[40px]">
            <div className="w-full lg:w-[500px] h-[400px] bg-gray-200 rounded-[20px]" />
            <div className="flex-1 space-y-4">
              <div className="h-8 w-2/3 bg-gray-200 rounded" />
              <div className="h-6 w-1/4 bg-gray-200 rounded" />
              <div className="h-10 w-1/3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !productData) {
    return (
      <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[16px] md:py-[20px] lg:py-[30px] xl:py-[40px] 2xl:py-[50px] 3xl:py-[60px]">
        <p className="text-center text-[18px] text-[#131314]">
          Товар не найден
        </p>
      </main>
    );
  }

  const currentProductData = activeProductData ?? productData;
  const linkedVariantProducts = activeVariantProducts;
  const hasLinkedVariants = linkedVariantProducts.length > 1;
  const currentPrimaryCategory = getPrimaryCategory(
    currentProductData.categories || [],
  );
  const phoneVariantsEnabled = shouldUsePhoneVariants({
    name: currentProductData.name,
    categories: currentProductData.categories || [],
  });
  const modificationOptions = modificationData.options.map((option) => ({
    ...option,
    isCurrent: option.id === currentProductData.id,
  }));
  const attributes = (currentProductData.attributes || []).map((attribute) => ({
    name: attribute.name,
    value: attribute.value,
  }));
  const configurations = phoneVariantsEnabled
      ? buildProductVariantConfigurations({
          currentProductId: currentProductData.id,
          currentProductName: currentProductData.name,
          currentAttributes: attributes,
          linkedProducts: linkedVariantProducts.map((variant) => ({
            id: variant.id,
            name: variant.name,
            attributes: variant.attributes || [],
          })),
        })
    : [];
  const hasConfigurationVariants = configurations.length > 0;

  const configurationColors = configurations
    .map((config) => config.color)
    .filter(Boolean);
  const configurationMemories = configurations
    .map((config) => config.memory)
    .filter(Boolean);
  const configurationSim = configurations.map((config) => config.sim).filter(Boolean);
  const configurationEsim = configurations
    .map((config) => config.esim)
    .filter(Boolean);

  const linkedVariantColors = linkedVariantProducts
    .map((variant) => variant.variantColor || "")
    .filter(Boolean);
  const linkedVariantMemories = linkedVariantProducts
    .map((variant) => variant.variantMemory || "")
    .filter(Boolean);
  const linkedVariantSim = linkedVariantProducts
    .map((variant) => variant.variantSim || "")
    .filter(Boolean);

  const colorValues = phoneVariantsEnabled
    ? sortColorOptions(
        unique(
          hasConfigurationVariants
            ? configurationColors
            : hasLinkedVariants
              ? linkedVariantColors
              : getValuesByNames(attributes, COLOR_NAMES, { exact: true }),
        ),
      )
    : [];
  const storageValues = phoneVariantsEnabled
    ? sortStorageOptions(
        unique(
          hasConfigurationVariants
            ? configurationMemories
            : hasLinkedVariants
              ? linkedVariantMemories
              : getValuesByNames(attributes, STORAGE_NAMES),
        ),
      )
    : [];
  const simValues = phoneVariantsEnabled
    ? sortSimOptions(
        unique(
          hasConfigurationVariants
            ? configurationSim
            : hasLinkedVariants
              ? linkedVariantSim
              : getValuesByNames(attributes, SIM_NAMES),
        ),
      )
    : [];
  const esimValues = phoneVariantsEnabled
    ? sortSimOptions(
        unique(
          hasConfigurationVariants
            ? configurationEsim
            : getValuesByNames(attributes, ESIM_NAMES),
        ),
      )
    : [];
  const simEsimDisplay = getSimEsimDisplay({
    attributes: phoneVariantsEnabled ? attributes : [],
    title: currentProductData.name,
  });
  const firstImage =
    currentProductData.images && currentProductData.images.length > 0
      ? currentProductData.images[0].url
      : "/images/placeholder-product.png";

  const colors = colorValues.map((value, index) => ({
    id: `color-${index}`,
    name: value,
    image: firstImage,
  }));

  const baseSpecifications = attributes
    .filter((attribute) => {
      if (isVariantConfigurationAttributeName(attribute.name)) return false;
      if (phoneVariantsEnabled) return !isOptionAttribute(attribute.name);
      return !isMatch(attribute.name, SIM_NAMES) && !isMatch(attribute.name, ESIM_NAMES);
    })
    .map((attribute) => ({
      label: attribute.name,
      value: attribute.value,
    }));

  const optionSpecifications = phoneVariantsEnabled
    ? [
        ...(colorValues.length > 0
          ? [{ label: "Доступные цвета", value: colorValues.join(", ") }]
          : []),
        ...(storageValues.length > 0
          ? [{ label: "Варианты памяти", value: storageValues.join(", ") }]
          : []),
        ...(simValues.length > 0
          ? [{ label: "Варианты SIM", value: simValues.join(", ") }]
          : []),
        ...(esimValues.length > 0
          ? [{ label: "Варианты eSIM", value: esimValues.join(", ") }]
          : []),
      ]
    : [];
  const specifications = buildProductSpecifications({
    name: currentProductData.name,
    description: currentProductData.description,
    brandName: currentProductData.brand?.name,
    categoryTitle: currentPrimaryCategory?.title,
    totalStock: currentProductData.totalStock,
    baseSpecifications,
    optionSpecifications,
  });

  const currentProductPrice = parseFloat(currentProductData.price);
  const querySelection: ProductVariantSelection = {
    color: searchParams.get("color") || undefined,
    memory: searchParams.get("memory") || undefined,
    sim: searchParams.get("sim") || undefined,
    esim: searchParams.get("esim") || undefined,
  };
  const selectedConfigurationFromQuery =
    findProductVariantConfigurationBySelection(
      configurations,
      currentProductData.id,
      querySelection,
    );
  const selectedConfigurationFromState =
    selectedLinkedVariant?.sourceProductId === productData.id &&
    selectedLinkedVariant.id === currentProductData.id
      ? findProductVariantConfigurationBySelection(
          configurations,
          currentProductData.id,
          selectedLinkedVariant.selection,
        )
      : undefined;
  const primaryConfiguration =
    selectedConfigurationFromState ||
    selectedConfigurationFromQuery ||
    getPreferredProductConfiguration(
      configurations,
      currentProductData.id,
      currentProductPrice,
    ) || configurations[0];
  const defaultColorName =
    primaryConfiguration?.color ||
    currentProductData.variantColor ||
    colorValues[0] ||
    "";
  const defaultStorage =
    primaryConfiguration?.memory ||
    currentProductData.variantMemory ||
    storageValues[0] ||
    "";
  const defaultSim =
    primaryConfiguration?.sim ||
    currentProductData.variantSim ||
    simValues[0] ||
    "";
  const defaultEsim = primaryConfiguration?.esim || esimValues[0] || "";
  const linkedVariants = linkedVariantProducts.map((variant) => {
    const variantPrice = parseFloat(variant.price);
    const variantConfiguration = getPreferredProductConfiguration(
      configurations,
      variant.id,
      variantPrice,
    );

    return {
      id: variant.id,
      slug: variant.slug,
      color: variantConfiguration?.color || variant.variantColor || "",
      memory: variantConfiguration?.memory || variant.variantMemory || "",
      sim: variantConfiguration?.sim || variant.variantSim || "",
      price: variantConfiguration?.price ?? variantPrice,
      oldPrice:
        variantConfiguration?.oldPrice ??
        (variant.oldPrice ? parseFloat(variant.oldPrice) : undefined),
      isActive: variant.isActive,
      inStock: (variant.totalStock || 0) > 0,
    };
  });

  const product = {
    id: currentProductData.id,
    slug: currentProductData.slug,
    title: currentProductData.name,
    description: currentProductData.description?.trim() || undefined,
    price: currentProductPrice,
    oldPrice: currentProductData.oldPrice
      ? parseFloat(currentProductData.oldPrice)
      : undefined,
    discount: currentProductData.oldPrice
      ? Math.round(
          ((parseFloat(currentProductData.oldPrice) -
            parseFloat(currentProductData.price)) /
            parseFloat(currentProductData.oldPrice)) *
            100,
        )
      : undefined,
    rating: currentProductData.rating,
    reviewsCount: currentProductData.reviewCount,
    images:
      currentProductData.images && currentProductData.images.length > 0
        ? currentProductData.images.map((img) => img.url)
        : ["/images/placeholder-product.png"],
    colors,
    storageOptions: storageValues,
    selectedStorage: defaultStorage,
    selectedColor:
      colors.find(
        (color) =>
          normalizeVariantOption(color.name) ===
          normalizeVariantOption(defaultColorName),
      )
        ?.id || colors[0]?.id || "",
    simOptions: simValues,
    selectedSim: defaultSim,
    esimOptions: esimValues,
    selectedEsim: defaultEsim,
    simEsimDisplay: simEsimDisplay || undefined,
    modificationOptions,
    variantConfigurations: configurations,
    linkedVariants,
    specifications,
    deliveryInfo: {
      pickup:
        currentProductData.productStock && currentProductData.productStock.length > 0
          ? `Доступно в ${currentProductData.productStock.length} точках`
          : "Нет в наличии",
      courier: "до МКАД от 590 ₽, за МКАД от 990 ₽",
    },
    category: currentPrimaryCategory?.title || "Товары",
    subcategory: currentPrimaryCategory?.title || "Товары",
    inStock: currentProductData.totalStock > 0,
    isNew:
      new Date(currentProductData.createdAt) >
      new Date(NOW_TIMESTAMP - NEW_PRODUCT_WINDOW_MS),
    isSale: currentProductData.isOnSale,
    reviews: currentProductData.reviews || [],
  };

  const relatedProducts = relatedProductsData?.data
    ? relatedProductsData.data
        .filter((p) => p.id !== currentProductData.id)
        .slice(0, 5)
        .map(productResponseToCard)
    : [];
  const manualRelatedProducts = currentProductData.relatedProducts
    ?.filter((relation) => relation.targetProduct.isActive)
    .map((relation) => manualRelatedProductToCard(relation.targetProduct)) || [];
  const manualRelatedProductIds = new Set(
    manualRelatedProducts.map((product) => product.id),
  );
  const accessoryProducts = accessoriesProductsData?.data
    ? accessoriesProductsData.data
        .filter(
          (p) =>
            p.id !== currentProductData.id && !manualRelatedProductIds.has(p.id),
        )
        .slice(0, 5)
        .map(productResponseToCard)
    : [];

  const breadcrumbCategories = getBreadcrumbCategories(
    currentProductData.categories || [],
    categoryTree,
    currentProductData.name,
    currentProductData.attributes || [],
  );

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/categories" },
    ...breadcrumbCategories.map((category) => ({
      label: category.title,
      href: `/catalog/${encodeURIComponent(category.slug)}`,
    })),
    { label: product.title },
  ];
  return (
    <main className="max-w-[1920px] mx-auto px-[16px] md:px-[24px] lg:px-[40px] xl:px-[60px] 2xl:px-[120px] 3xl:px-[140px] 3xl:px-[180px] py-[16px] md:py-[20px] lg:py-[30px] xl:py-[40px] 2xl:py-[50px] 3xl:py-[60px]">
      <Breadcrumb
        items={breadcrumbItems}
        className="mb-[16px] md:mb-[20px] lg:mb-[30px] xl:mb-[40px] 2xl:mb-[50px]"
      />
      <div className="relative flex flex-col lg:flex-row gap-[24px] md:gap-[30px] lg:gap-[40px] xl:gap-[60px] 2xl:gap-[80px] 3xl:gap-[100px]">
        <div className="w-full lg:shrink-0 lg:w-auto">
          <ProductGallery product={product} />
        </div>
        <div className="flex-1 relative min-w-0">
          <ProductInfo
            key={product.id}
            product={product}
            heading={
              currentProductData.id === productData.id
                ? initialSeoH1 || currentProductData.seoH1 || product.title
                : currentProductData.seoH1 || product.title
            }
            onModificationSelect={handleModificationSelect}
            onLinkedVariantSelect={handleLinkedVariantSelect}
          />
        </div>
      </div>
      <ProductTabs product={product} />
      {manualRelatedProducts.length > 0 && (
        <RelatedProducts
          title="Дополнительные товары"
          products={manualRelatedProducts}
        />
      )}
      {accessoryProducts.length > 0 && (
        <RelatedProducts
          title="Аксессуары к товару"
          products={accessoryProducts}
        />
      )}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </main>
  );
}
