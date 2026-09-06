export interface ProductSpecificationLike {
  label: string;
  value: string;
}

interface ProductCategoryLike {
  title?: string | null;
  slug?: string | null;
  category?: {
    title?: string | null;
    slug?: string | null;
  } | null;
}

interface ShouldUsePhoneVariantsInput {
  name: string;
  categories?: ProductCategoryLike[];
}

interface BuildProductSpecificationsInput {
  name: string;
  description?: string | null;
  brandName?: string | null;
  categoryTitle?: string | null;
  totalStock?: number;
  baseSpecifications: ProductSpecificationLike[];
  optionSpecifications: ProductSpecificationLike[];
}

const DESCRIPTION_SPEC_LABELS = [
  "Процессор",
  "Память",
  "Хранилище",
  "Дисплей",
  "Экран",
  "Батарея",
  "Аккумулятор",
  "Камера",
  "Корпус",
  "Поддержка",
  "Безопасность",
  "Комплектация",
];

const SPEC_LABEL_ALIASES: Record<string, string[]> = {
  память: ["оперативная память"],
  хранилище: ["накопитель", "встроенная память"],
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function cleanValue(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\s+([,.])/g, "$1").trim();
}

function formatCapacity(amount: string, unit: string): string {
  const normalizedAmount = amount.replace(",", ".").replace(/\.0$/, "");
  const normalizedUnit = unit.toLowerCase().startsWith("т") ? "ТБ" : "ГБ";
  return `${normalizedAmount} ${normalizedUnit}`;
}

function addSpec(
  specs: ProductSpecificationLike[],
  seen: Set<string>,
  label: string,
  value?: string | null,
) {
  const cleanLabel = cleanValue(label);
  const cleanSpecValue = value ? cleanValue(value) : "";
  if (!cleanLabel || !cleanSpecValue) return;

  const labelKey = normalizeText(cleanLabel);
  const valueKey = normalizeText(cleanSpecValue);
  const fullKey = `${labelKey}::${valueKey}`;
  const aliases = SPEC_LABEL_ALIASES[labelKey] ?? [];
  if (seen.has(labelKey) || seen.has(fullKey) || aliases.some((alias) => seen.has(alias))) {
    return;
  }

  seen.add(labelKey);
  seen.add(fullKey);
  specs.push({ label: cleanLabel, value: cleanSpecValue });
}

function extractTitleSpecifications(name: string): ProductSpecificationLike[] {
  const specs: ProductSpecificationLike[] = [];
  const seen = new Set<string>();
  const modelMatch = name.match(/\[([^\]]+)\]/);
  addSpec(specs, seen, "Модель", modelMatch?.[1]);

  const appleSiliconMatch = name.match(/\b(M\d(?:\s?(?:Pro|Max|Ultra))?)\b/i);
  if (appleSiliconMatch) {
    addSpec(specs, seen, "Процессор", `Apple ${appleSiliconMatch[1].replace(/\s+/g, " ")}`);
  }

  const appleMobileChipMatch = name.match(/\b(A\d{2}(?:\s?Pro|\s?Bionic)?)\b/i);
  if (!appleSiliconMatch && appleMobileChipMatch) {
    addSpec(specs, seen, "Процессор", `Apple ${appleMobileChipMatch[1].replace(/\s+/g, " ")}`);
  }

  const slashMemoryMatch = name.match(
    /(^|[^\d])(\d{1,3})\s*\/\s*(\d{2,4})\s*(ГБ|GB|ТБ|TB)(?=$|[^\p{L}\p{N}])/iu,
  );
  if (slashMemoryMatch) {
    addSpec(specs, seen, "Оперативная память", `${slashMemoryMatch[2]} ГБ`);
    addSpec(
      specs,
      seen,
      "Встроенная память",
      formatCapacity(slashMemoryMatch[3], slashMemoryMatch[4]),
    );
  } else {
    const capacities = Array.from(
      name.matchAll(/(^|[^\d])(\d+(?:[,.]\d+)?)\s*(ГБ|GB|ТБ|TB)(?=$|[^\p{L}\p{N}])/giu),
    );
    if (capacities.length >= 2) {
      addSpec(
        specs,
        seen,
        "Оперативная память",
        formatCapacity(capacities[0][2], capacities[0][3]),
      );
      addSpec(
        specs,
        seen,
        "Накопитель",
        formatCapacity(capacities[1][2], capacities[1][3]),
      );
    } else if (capacities.length === 1) {
      addSpec(
        specs,
        seen,
        "Встроенная память",
        formatCapacity(capacities[0][2], capacities[0][3]),
      );
    }
  }

  const cpuMatch = name.match(/\b(\d+)\s*[- ]?CPU\b/i);
  addSpec(specs, seen, "CPU", cpuMatch ? `${cpuMatch[1]} ядер` : null);

  const gpuMatch = name.match(/\b(\d+)\s*[- ]?GPU\b/i);
  addSpec(specs, seen, "GPU", gpuMatch ? `${gpuMatch[1]} ядер` : null);

  const displayMatch = name.match(
    /\b(\d+(?:[,.]\d+)?)\s*(?:дюйм(?:а|ов)?|″|")(?=$|[^\p{L}\p{N}])/iu,
  );
  addSpec(
    specs,
    seen,
    "Диагональ",
    displayMatch ? `${displayMatch[1].replace(",", ".")} дюймов` : null,
  );

  const nameWithoutModel = name
    .replace(/\s*\[[^\]]+\]\s*/g, "")
    .replace(/\s*"[^"]*"\s*$/g, "")
    .trim();
  const colorMatch = nameWithoutModel.match(/,\s*([^,]+?\([^)]+\))\s*$/);
  addSpec(specs, seen, "Цвет", colorMatch?.[1]);

  return specs;
}

function extractDescriptionSpecifications(
  description?: string | null,
): ProductSpecificationLike[] {
  if (!description) return [];

  const markerMatch = description.match(/основные характеристики\s*:/i);
  const source = markerMatch
    ? description.slice((markerMatch.index ?? 0) + markerMatch[0].length)
    : description;
  const stopIndex = source.search(/дополнительные особенности\s*:/i);
  const specsText = stopIndex >= 0 ? source.slice(0, stopIndex) : source;
  const labelPattern = DESCRIPTION_SPEC_LABELS.join("|");
  const matcher = new RegExp(
    `(${labelPattern})\\s*:\\s*([\\s\\S]*?)(?=\\s+(?:${labelPattern})\\s*:|$)`,
    "gi",
  );

  const specs: ProductSpecificationLike[] = [];
  const seen = new Set<string>();
  for (const match of specsText.matchAll(matcher)) {
    addSpec(specs, seen, match[1], match[2]);
  }

  return specs;
}

export function shouldUsePhoneVariants({
  name,
  categories = [],
}: ShouldUsePhoneVariantsInput): boolean {
  const normalizedName = normalizeText(name);
  const categoryText = categories
    .map((item) => {
      const category = item.category ?? item;
      return `${category.title ?? ""} ${category.slug ?? ""}`;
    })
    .join(" ");
  const normalizedCategoryText = normalizeText(categoryText);

  if (/(iphone|смартфон|телефон)/i.test(normalizedName)) return true;
  if (/\bgalaxy\s+(?:s|z|a|m|note)\d/i.test(normalizedName)) return true;
  if (/\bpixel\s+\d/i.test(normalizedName)) return true;

  return /(смартфон|телефон|iphone)/i.test(normalizedCategoryText);
}

export function buildProductSpecifications({
  name,
  description,
  brandName,
  categoryTitle,
  totalStock,
  baseSpecifications,
  optionSpecifications,
}: BuildProductSpecificationsInput): ProductSpecificationLike[] {
  const specs: ProductSpecificationLike[] = [];
  const seen = new Set<string>();

  for (const spec of baseSpecifications) {
    addSpec(specs, seen, spec.label, spec.value);
  }

  for (const spec of extractTitleSpecifications(name)) {
    addSpec(specs, seen, spec.label, spec.value);
  }

  for (const spec of extractDescriptionSpecifications(description)) {
    addSpec(specs, seen, spec.label, spec.value);
  }

  for (const spec of optionSpecifications) {
    addSpec(specs, seen, spec.label, spec.value);
  }

  addSpec(specs, seen, "Бренд", brandName);
  addSpec(specs, seen, "Категория", categoryTitle);
  if (typeof totalStock === "number") {
    addSpec(
      specs,
      seen,
      "Наличие",
      totalStock > 0 ? "В наличии" : "Нет в наличии",
    );
  }
  addSpec(specs, seen, "Доставка", "до МКАД от 590 ₽, за МКАД от 990 ₽");

  return specs;
}
