import type { ProductVariantConfiguration } from "../model";

type ProductVariantAttribute = {
  name: string;
  value: string;
};

type ProductWithVariantAttributes = {
  id: string;
  name?: string;
  attributes?: ProductVariantAttribute[];
};

export type ProductVariantSelection = {
  color?: string;
  memory?: string;
  sim?: string;
  esim?: string;
};

const CONFIGURATION_NAMES = [
  "конфигурации",
  "конфигурации товара",
  "конфигурации цены",
  "конфигурациям",
  "цены по конфигурациям",
  "цена по конфигурациям",
  "variant configurations",
  "product configurations",
  "price configurations",
  "configurations",
];
const COLOR_ATTRIBUTE_NAMES = ["цвет", "color"];
const MEMORY_ATTRIBUTE_NAMES = [
  "память",
  "встроенная память",
  "объем встроенной памяти",
  "объём встроенной памяти",
  "memory",
  "storage",
];

export function normalizeVariantOption(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[‐‑‒–—-]/g, " ")
    .replace(/\s*\+\s*/g, "+")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAttributeName(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function compactVariantOption(value?: string): string {
  return normalizeVariantOption(value).replace(/\s+/g, "");
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value
      .replace(/\u00A0/g, "")
      .replace(/\s+/g, "")
      .replace(/₽|руб\.?/gi, "")
      .replace(",", ".")
      .trim();
    if (!normalized) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getConfigurationKey(config: ProductVariantConfiguration): string {
  return [
    config.linkedProductId || "",
    normalizeVariantOption(config.color),
    normalizeVariantOption(config.memory),
    normalizeVariantOption(config.sim),
    normalizeVariantOption(config.esim),
  ].join("::");
}

function configurationMatchesSelection(
  config: ProductVariantConfiguration,
  selection: ProductVariantSelection,
): boolean {
  const checks: Array<[string | undefined, string | undefined]> = [
    [config.color, selection.color],
    [config.memory, selection.memory],
    [config.sim, selection.sim],
    [config.esim, selection.esim],
  ];

  return checks.every(([configValue, selectedValue]) => {
    const normalizedSelected = normalizeVariantOption(selectedValue);
    if (!normalizedSelected) return true;
    return normalizeVariantOption(configValue) === normalizedSelected;
  });
}

function attributeNameMatches(name: string, names: string[]): boolean {
  const normalizedName = normalizeAttributeName(name);

  return names.some((term) => {
    const normalizedTerm = normalizeAttributeName(term);
    return (
      normalizedName === normalizedTerm ||
      normalizedName.includes(normalizedTerm)
    );
  });
}

function getAttributeValuesByNames(
  attributes: ProductVariantAttribute[] | undefined,
  names: string[],
): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  attributes?.forEach((attribute) => {
    if (!attributeNameMatches(attribute.name, names)) return;

    const normalizedValue = normalizeVariantOption(attribute.value);
    if (!normalizedValue || seen.has(normalizedValue)) return;

    seen.add(normalizedValue);
    values.push(attribute.value);
  });

  return values;
}

function valueEqualsOrContains(candidate: string | undefined, value: string): boolean {
  const compactCandidate = compactVariantOption(candidate);
  const compactValue = compactVariantOption(value);

  return (
    Boolean(compactCandidate && compactValue) &&
    (compactCandidate === compactValue ||
      compactCandidate.includes(compactValue) ||
      compactValue.includes(compactCandidate))
  );
}

function productIdentityMatchesValue({
  value,
  product,
  attributeNames,
}: {
  value: string;
  product: ProductWithVariantAttributes;
  attributeNames: string[];
}): boolean {
  if (!normalizeVariantOption(value)) return true;

  if (valueEqualsOrContains(product.name, value)) {
    return true;
  }

  const attributeValues = getAttributeValuesByNames(
    product.attributes,
    attributeNames,
  );
  if (!attributeValues.length) {
    return true;
  }

  return attributeValues.length === 1
    ? valueEqualsOrContains(attributeValues[0], value)
    : false;
}

function configurationBelongsToProduct(
  config: ProductVariantConfiguration,
  product: ProductWithVariantAttributes,
): boolean {
  return (
    productIdentityMatchesValue({
      value: config.color,
      product,
      attributeNames: COLOR_ATTRIBUTE_NAMES,
    }) &&
    productIdentityMatchesValue({
      value: config.memory,
      product,
      attributeNames: MEMORY_ATTRIBUTE_NAMES,
    })
  );
}

export function isVariantConfigurationAttributeName(name: string): boolean {
  const normalized = normalizeAttributeName(name);
  return CONFIGURATION_NAMES.some((term) =>
    normalized.includes(normalizeAttributeName(term)),
  );
}

export function parseVariantConfigurationValue(
  value: string,
): ProductVariantConfiguration[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const uniqueMap = new Map<string, ProductVariantConfiguration>();
  parsed.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const price = parseNumber(row.price);
    if (price === null || price < 0) return;

    const oldPrice = parseNumber(row.oldPrice);
    const linkedProductId = String(row.linkedProductId ?? "").trim();
    const config: ProductVariantConfiguration = {
      color: String(row.color ?? "").trim(),
      memory: String(row.memory ?? "").trim(),
      sim: String(row.sim ?? "").trim(),
      esim: String(row.esim ?? "").trim(),
      price,
      oldPrice: oldPrice !== null && oldPrice >= 0 ? oldPrice : undefined,
      linkedProductId: linkedProductId || undefined,
    };

    uniqueMap.set(getConfigurationKey(config), config);
  });

  return Array.from(uniqueMap.values());
}

export function getVariantConfigurationsFromAttributes(
  attributes: ProductVariantAttribute[] | undefined,
  fallbackLinkedProductId?: string,
  fallbackProduct?: ProductWithVariantAttributes,
): ProductVariantConfiguration[] {
  if (!attributes?.length) return [];

  return attributes
    .filter((attribute) => isVariantConfigurationAttributeName(attribute.name))
    .flatMap((attribute) => parseVariantConfigurationValue(attribute.value))
    .filter(
      (config) =>
        config.linkedProductId ||
        !fallbackProduct ||
        configurationBelongsToProduct(config, fallbackProduct),
    )
    .map((config) => ({
      ...config,
      linkedProductId: config.linkedProductId || fallbackLinkedProductId,
    }));
}

export function buildProductVariantConfigurations({
  currentProductId,
  currentProductName,
  currentAttributes,
  linkedProducts,
}: {
  currentProductId: string;
  currentProductName?: string;
  currentAttributes: ProductVariantAttribute[] | undefined;
  linkedProducts: ProductWithVariantAttributes[];
}): ProductVariantConfiguration[] {
  const uniqueMap = new Map<string, ProductVariantConfiguration>();

  const addConfigurations = (
    product: ProductWithVariantAttributes,
  ) => {
    getVariantConfigurationsFromAttributes(
      product.attributes,
      product.id,
      product,
    ).forEach((config) => {
      const key = getConfigurationKey(config);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, config);
      }
    });
  };

  addConfigurations({
    id: currentProductId,
    name: currentProductName,
    attributes: currentAttributes,
  });
  linkedProducts.forEach((product) => {
    addConfigurations(product);
  });

  return Array.from(uniqueMap.values());
}

export function findProductVariantConfigurationBySelection(
  configurations: ProductVariantConfiguration[],
  productId: string,
  selection: ProductVariantSelection,
): ProductVariantConfiguration | undefined {
  const hasSelection = Object.values(selection).some((value) =>
    Boolean(normalizeVariantOption(value)),
  );
  if (!hasSelection) return undefined;

  return configurations.find(
    (config) =>
      config.linkedProductId === productId &&
      configurationMatchesSelection(config, selection),
  );
}
