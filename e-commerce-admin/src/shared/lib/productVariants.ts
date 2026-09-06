export interface ProductAttributeInput {
  name: string;
  value: string;
}

export const CARD_ATTRIBUTE_PREFIX = 'В плитку: ';

export function isCardAttributeName(name: string): boolean {
  return /^в\s*плитку\s*:/i.test(name.trim());
}

export function stripCardAttributePrefix(name: string): string {
  return name.replace(/^в\s*плитку\s*:\s*/i, '').trim();
}

export function buildStoredAttributeName(
  name: string,
  showInCard: boolean,
): string {
  const cleanName = stripCardAttributePrefix(name).trim();
  return showInCard ? `${CARD_ATTRIBUTE_PREFIX}${cleanName}` : cleanName;
}

export interface PhoneVariantConfigurationDraft {
  color: string;
  memory: string;
  sim: string;
  esim: string;
  price: string;
  oldPrice: string;
  linkedProductId?: string;
}

export interface PhoneVariantConfiguration {
  color: string;
  memory: string;
  sim: string;
  esim: string;
  price: number;
  oldPrice?: number | null;
  linkedProductId?: string | null;
}

export interface PhoneVariantOptions {
  colors: string[];
  memories: string[];
  sim: string[];
  esim: string[];
  configurations: PhoneVariantConfigurationDraft[];
}

export interface ProductVariantSummarySource {
  name?: string | null;
  variantColor?: string | null;
  variantMemory?: string | null;
  variantSim?: string | null;
  price?: string | number | null;
  oldPrice?: string | number | null;
  attributes?: ProductAttributeInput[] | null;
}

export interface ProductVariantSummary {
  color: string;
  memory: string;
  sim: string;
  price: string;
  oldPrice: string;
}

const COLOR_NAMES = ['цвет', 'color'];
const MEMORY_NAMES = ['память', 'storage', 'встроенная память', 'объем памяти'];
const SIM_NAMES = ['sim', 'sim-карт', 'сим', 'количество sim'];
const ESIM_NAMES = ['esim', 'e-sim', 'e sim', 'eсим'];
const CONFIGURATION_NAMES = [
  'конфигурации',
  'конфигурации товара',
  'конфигурации цены',
  'variant configurations',
  'product configurations',
  'configurations',
];

export const PHONE_VARIANT_CONFIG_ATTRIBUTE_NAME = 'Конфигурации';

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/ё/g, 'е').trim();
}

function compactText(value?: string | null): string {
  return normalizeText(String(value || '')).replace(/\s+/g, '');
}

function formatNumberForInput(value: number): string {
  if (!Number.isFinite(value)) return '';
  if (Number.isInteger(value)) return String(value);
  return String(value).replace(/\.0+$/, '');
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value
      .replace(/\u00A0/g, '')
      .replace(/\s+/g, '')
      .replace(/₽|руб\.?/gi, '')
      .replace(',', '.')
      .trim();

    if (!normalized) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatPriceLabel(value?: string | number | null): string {
  const parsed = parseNumber(value);
  if (parsed === null) return '';

  const formatted = new Intl.NumberFormat('ru-RU')
    .format(parsed)
    .replace(/\u00A0/g, ' ');
  return `${formatted} ₽`;
}

function isColorAttributeName(name: string): boolean {
  return isMatch(name, COLOR_NAMES);
}

function isMemoryAttributeName(name: string): boolean {
  const normalized = normalizeText(name);
  if (normalized.includes('оператив')) return false;

  return isMatch(name, MEMORY_NAMES);
}

function getAttributeValues(
  attributes: ProductAttributeInput[] | null | undefined,
  matcher: (name: string) => boolean,
): string[] {
  const values: string[] = [];

  attributes?.forEach((attribute) => {
    if (!matcher(attribute.name)) return;
    values.push(...splitPossibleValues(attribute.value));
  });

  return uniqueStrings(values);
}

function nameContainsValue(name: string | null | undefined, value: string): boolean {
  const compactName = compactText(name);
  const compactValue = compactText(value);

  return Boolean(compactName && compactValue && compactName.includes(compactValue));
}

function pickSingleProductValue({
  name,
  values,
  fallback,
}: {
  name?: string | null;
  values: string[];
  fallback?: string | null;
}): string {
  const fromName = values.find((value) => nameContainsValue(name, value));
  if (fromName) return fromName;

  if (values.length === 1) return values[0];

  return fallback?.trim() || '';
}

function pickJoinedProductValue({
  values,
  fallback,
}: {
  values: string[];
  fallback?: string | null;
}): string {
  if (values.length > 0) return values.join(' / ');

  return fallback?.trim() || '';
}

function toConfigDraft(
  config: PhoneVariantConfiguration,
): PhoneVariantConfigurationDraft {
  return {
    color: config.color,
    memory: config.memory,
    sim: config.sim,
    esim: config.esim,
    price: formatNumberForInput(config.price),
    oldPrice:
      config.oldPrice !== undefined && config.oldPrice !== null
        ? formatNumberForInput(config.oldPrice)
        : '',
    linkedProductId: config.linkedProductId?.trim() || '',
  };
}

function uniqueConfigurations(
  configs: PhoneVariantConfiguration[],
): PhoneVariantConfiguration[] {
  const map = new Map<string, PhoneVariantConfiguration>();

  configs.forEach((config) => {
    const key = [
      normalizeText(config.color),
      normalizeText(config.memory),
      normalizeText(config.sim),
      normalizeText(config.esim),
    ].join('::');
    map.set(key, config);
  });

  return Array.from(map.values());
}

export function parseConfigurationValue(
  value: string,
): PhoneVariantConfiguration[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  let parsedValue: unknown = null;
  try {
    parsedValue = JSON.parse(trimmed);
  } catch {
    return [];
  }

  if (!Array.isArray(parsedValue)) return [];

  const result: PhoneVariantConfiguration[] = [];

  parsedValue.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const row = item as Record<string, unknown>;

    const price = parseNumber(row.price);
    if (price === null || price < 0) return;

    const oldPrice = parseNumber(row.oldPrice);
    const color = String(row.color ?? '').trim();
    const memory = String(row.memory ?? '').trim();
    const sim = String(row.sim ?? '').trim();
    const esim = String(row.esim ?? '').trim();
    const linkedProductId = String(row.linkedProductId ?? '').trim();

    result.push({
      color,
      memory,
      sim,
      esim,
      price,
      oldPrice:
        oldPrice !== null && oldPrice >= 0
          ? oldPrice
          : undefined,
      linkedProductId: linkedProductId || undefined,
    });
  });

  return uniqueConfigurations(result);
}

export function normalizeConfigurationDrafts(
  drafts: PhoneVariantConfigurationDraft[],
): PhoneVariantConfiguration[] {
  const normalized: PhoneVariantConfiguration[] = [];

  drafts.forEach((draft) => {
    const price = parseNumber(draft.price);
    if (price === null || price < 0) return;

    const oldPrice = parseNumber(draft.oldPrice);
    normalized.push({
      color: draft.color.trim(),
      memory: draft.memory.trim(),
      sim: draft.sim.trim(),
      esim: draft.esim.trim(),
      price,
      oldPrice:
        oldPrice !== null && oldPrice >= 0
          ? oldPrice
          : undefined,
      linkedProductId: draft.linkedProductId?.trim() || undefined,
    });
  });

  return uniqueConfigurations(normalized);
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeText(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function splitPossibleValues(value: string): string[] {
  const cleaned = value.trim();
  if (!cleaned) return [];

  if (cleaned.includes(',') || cleaned.includes(';') || cleaned.includes('|')) {
    return cleaned
      .split(/[;,|]/g)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [cleaned];
}

function isMatch(name: string, terms: string[]): boolean {
  const normalized = normalizeText(name);
  return terms.some((term) => normalized.includes(term));
}

export function createEmptyPhoneVariantOptions(): PhoneVariantOptions {
  return {
    colors: [],
    memories: [],
    sim: [],
    esim: [],
    configurations: [],
  };
}

export function getProductVariantSummary(
  product: ProductVariantSummarySource,
): ProductVariantSummary {
  const colors = getAttributeValues(product.attributes, isColorAttributeName);
  const memories = getAttributeValues(product.attributes, isMemoryAttributeName);
  const sims = getAttributeValues(product.attributes, (name) =>
    isMatch(name, SIM_NAMES),
  );

  return {
    color: pickSingleProductValue({
      name: product.name,
      values: colors,
      fallback: product.variantColor,
    }),
    memory: pickSingleProductValue({
      name: product.name,
      values: memories,
      fallback: product.variantMemory,
    }),
    sim: pickJoinedProductValue({
      values: sims,
      fallback: product.variantSim,
    }),
    price: formatPriceLabel(product.price),
    oldPrice: formatPriceLabel(product.oldPrice),
  };
}

export function getProductVariantOptionLabel(
  summary: Pick<ProductVariantSummary, 'color' | 'memory' | 'sim'>,
): string {
  return [summary.color, summary.memory, summary.sim]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(' / ');
}

export function toProductAttributesArray(
  input: unknown,
): ProductAttributeInput[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const row = item as Record<string, unknown>;
        const name = String(row.name ?? '').trim();
        const value = String(row.value ?? '').trim();
        if (!name || !value) return null;
        return { name, value };
      })
      .filter((item): item is ProductAttributeInput => Boolean(item));
  }

  if (typeof input === 'object') {
    const result: ProductAttributeInput[] = [];
    for (const [name, raw] of Object.entries(input as Record<string, unknown>)) {
      if (!name.trim() || raw === null || raw === undefined) continue;

      if (Array.isArray(raw)) {
        raw.forEach((entry) => {
          const value = String(entry ?? '').trim();
          if (value) result.push({ name: name.trim(), value });
        });
      } else {
        const value = String(raw).trim();
        if (value) result.push({ name: name.trim(), value });
      }
    }
    return result;
  }

  return [];
}

export function splitVariantAndOtherAttributes(input: unknown): {
  variantOptions: PhoneVariantOptions;
  otherAttributes: ProductAttributeInput[];
  hadVariantAttributes: boolean;
} {
  const attributes = toProductAttributesArray(input);

  const colors: string[] = [];
  const memories: string[] = [];
  const sim: string[] = [];
  const esim: string[] = [];
  const configurations: PhoneVariantConfigurationDraft[] = [];
  const otherAttributes: ProductAttributeInput[] = [];
  let hadVariantAttributes = false;

  for (const attribute of attributes) {
    if (isMatch(attribute.name, COLOR_NAMES)) {
      colors.push(...splitPossibleValues(attribute.value));
      hadVariantAttributes = true;
      continue;
    }

    if (isMatch(attribute.name, MEMORY_NAMES)) {
      memories.push(...splitPossibleValues(attribute.value));
      hadVariantAttributes = true;
      continue;
    }

    if (isMatch(attribute.name, ESIM_NAMES)) {
      esim.push(...splitPossibleValues(attribute.value));
      hadVariantAttributes = true;
      continue;
    }

    if (isMatch(attribute.name, SIM_NAMES)) {
      sim.push(...splitPossibleValues(attribute.value));
      hadVariantAttributes = true;
      continue;
    }

    if (isMatch(attribute.name, CONFIGURATION_NAMES)) {
      const parsedConfigurations = parseConfigurationValue(attribute.value);
      if (parsedConfigurations.length > 0) {
        parsedConfigurations.forEach((config) => {
          configurations.push(toConfigDraft(config));
          if (config.color) colors.push(config.color);
          if (config.memory) memories.push(config.memory);
          if (config.sim) sim.push(config.sim);
          if (config.esim) esim.push(config.esim);
        });
      }
      hadVariantAttributes = true;
      continue;
    }

    otherAttributes.push(attribute);
  }

  return {
    variantOptions: {
      colors: uniqueStrings(colors),
      memories: uniqueStrings(memories),
      sim: uniqueStrings(sim),
      esim: uniqueStrings(esim),
      configurations,
    },
    otherAttributes,
    hadVariantAttributes,
  };
}

export function buildVariantAttributes(
  options: PhoneVariantOptions,
): ProductAttributeInput[] {
  const baseAttributes: ProductAttributeInput[] = [
    ...uniqueStrings(options.colors).map((value) => ({ name: 'Цвет', value })),
    ...uniqueStrings(options.memories).map((value) => ({
      name: 'Память',
      value,
    })),
    ...uniqueStrings(options.sim).map((value) => ({ name: 'SIM', value })),
    ...uniqueStrings(options.esim).map((value) => ({ name: 'eSIM', value })),
  ];

  const normalizedConfigurations = normalizeConfigurationDrafts(
    options.configurations,
  );
  if (normalizedConfigurations.length > 0) {
    baseAttributes.push({
      name: PHONE_VARIANT_CONFIG_ATTRIBUTE_NAME,
      value: JSON.stringify(normalizedConfigurations),
    });
  }

  return baseAttributes;
}
