import { normalizeVariantOption } from "./variantConfigurations";

export type ColorSwatchStyle = {
  backgroundColor?: string;
  backgroundImage?: string;
  borderColor?: string;
};

const COLOR_SWATCHES: Array<{
  tokens: string[];
  style: ColorSwatchStyle;
}> = [
  {
    tokens: ["transparent", "прозрач", "ice"],
    style: {
      backgroundColor: "#ffffff",
      backgroundImage:
        "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
    },
  },
  {
    tokens: ["camouflage", "camo", "камуфляж"],
    style: {
      backgroundImage:
        "linear-gradient(135deg, #4f5945 0 25%, #8b7d59 25% 50%, #343b31 50% 75%, #b0a174 75%)",
    },
  },
  { tokens: ["rose gold", "розовое золото", "розовый песок"], style: { backgroundColor: "#d9a0a0" } },
  { tokens: ["mist blue", "cloud blue", "sky blue", "light blue", "голуб", "небесно"], style: { backgroundColor: "#9ebdd2" } },
  { tokens: ["ultramarine", "ультрамарин"], style: { backgroundColor: "#4f62c8" } },
  { tokens: ["midnight", "deep blue", "dark blue", "pro blue", "prussian", "sapphire", "тёмно син", "темно син", "сапфир", "берлинская лазурь", "тихоокеан"], style: { backgroundColor: "#1f2a44" } },
  { tokens: ["lavender", "лаванд", "lilac", "лилов", "сирен"], style: { backgroundColor: "#c1b0d6" } },
  { tokens: ["plum", "сливов"], style: { backgroundColor: "#6f496d" } },
  { tokens: ["fuchsia", "фуксия", "barbie", "барби"], style: { backgroundColor: "#d94f91" } },
  { tokens: ["burgundy", "бордов", "бордо"], style: { backgroundColor: "#702f40" } },
  { tokens: ["coral", "коралл", "peach", "персик", "mango", "манго"], style: { backgroundColor: "#e58f73" } },
  { tokens: ["copper", "медн", "bronze", "бронз"], style: { backgroundColor: "#ad7351" } },
  { tokens: ["starlight", "сияющая звезда", "фарфоров"], style: { backgroundColor: "#eee7d8" } },
  { tokens: ["graphite", "графит", "carbon", "карбон", "kevlar black", "кевлар"], style: { backgroundColor: "#45484d" } },
  { tokens: ["gray", "grey", "серый", "nickel", "никель", "ash", "тонирован"], style: { backgroundColor: "#8d9299" } },
  { tokens: ["silver", "сереб"], style: { backgroundColor: "#d8dce2" } },
  { tokens: ["white", "бел"], style: { backgroundColor: "#f4f1ea", borderColor: "#d8dce2" } },
  { tokens: ["black", "черн", "чёрн"], style: { backgroundColor: "#111113" } },
  { tokens: ["desert", "sand", "песоч", "пустын", "беж", "латте", "sandstone", "песчаник"], style: { backgroundColor: "#d3b28d" } },
  { tokens: ["gold", "золот"], style: { backgroundColor: "#d8bd72" } },
  { tokens: ["natural", "натурал", "титанов"], style: { backgroundColor: "#c8c0b5" } },
  { tokens: ["mint", "мятн", "tiffany", "тиффани", "turquoise", "бирюз"], style: { backgroundColor: "#69c4b4" } },
  { tokens: ["lime", "лайм", "лимон", "салатов", "светло зелен", "светло зелён"], style: { backgroundColor: "#a8c955" } },
  { tokens: ["olive", "олив", "khaki", "хаки", "sage", "alpine", "альпий", "соснов", "dark green", "тёмно зелен", "тёмно зелён"], style: { backgroundColor: "#66735a" } },
  { tokens: ["green", "зелен", "зелён"], style: { backgroundColor: "#718b72" } },
  { tokens: ["pink", "розов"], style: { backgroundColor: "#f0b7c5" } },
  { tokens: ["purple", "фиолет", "пурпур"], style: { backgroundColor: "#8d7ab8" } },
  { tokens: ["red", "красн"], style: { backgroundColor: "#b21f2d" } },
  { tokens: ["yellow", "желт", "жёлт"], style: { backgroundColor: "#f4d35e" } },
  { tokens: ["cosmic orange", "orange", "оранж"], style: { backgroundColor: "#f47b20" } },
  { tokens: ["brown", "корич", "coffee", "кофейн", "walnut", "орехов", "dark earth", "земельн"], style: { backgroundColor: "#7b5c49" } },
  { tokens: ["blue", "синий"], style: { backgroundColor: "#365b91" } },
];

const COLOR_SORT_GROUPS = [
  ["black", "черн", "чёрн"],
  ["white", "бел"],
  ["silver", "сереб"],
  ["natural", "натурал", "титан"],
  ["desert", "sand", "песоч", "беж"],
  ["gold", "золот"],
  ["midnight", "deep blue", "тёмно синий", "темно синий"],
  ["синий", "blue", "ультрамарин"],
  ["голуб", "mist blue", "cloud blue", "sky blue"],
  ["green", "зелен", "зелён"],
  ["lavender", "лаванд", "лилов", "сирен"],
  ["purple", "фиолет", "пурпур"],
  ["pink", "розов"],
  ["yellow", "желт", "жёлт"],
  ["cosmic orange", "оранж"],
  ["red", "красн"],
];

function getStorageSizeInGb(value: string): number | null {
  const compact = normalizeVariantOption(value).replace(/\s+/g, "");
  const match = compact.match(/(\d+(?:[,.]\d+)?)(тб|tb|гб|gb)/i);
  if (!match) return null;

  const amount = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(amount)) return null;

  const unit = match[2].toLowerCase();
  return unit === "тб" || unit === "tb" ? amount * 1024 : amount;
}

export function sortStorageOptions(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const aSize = getStorageSizeInGb(a);
    const bSize = getStorageSizeInGb(b);

    if (aSize !== null && bSize !== null && aSize !== bSize) {
      return aSize - bSize;
    }

    if (aSize !== null && bSize === null) return -1;
    if (aSize === null && bSize !== null) return 1;

    return a.localeCompare(b, "ru", { numeric: true, sensitivity: "base" });
  });
}

function getColorSortOrder(value: string): number {
  const normalized = normalizeVariantOption(value);
  const index = COLOR_SORT_GROUPS.findIndex((tokens) =>
    tokens.some((token) => normalized.includes(normalizeVariantOption(token))),
  );

  return index === -1 ? COLOR_SORT_GROUPS.length : index;
}

function findColorSwatchStyle(colorName: string): ColorSwatchStyle | undefined {
  const normalized = normalizeVariantOption(colorName);
  return COLOR_SWATCHES.find((swatch) =>
    swatch.tokens.some((token) =>
      normalized.includes(normalizeVariantOption(token)),
    ),
  )?.style;
}

function buildMultiColorGradient(colorName: string): ColorSwatchStyle | undefined {
  const parts = colorName
    .split(/[/,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return undefined;

  const colors = parts
    .map((part) => findColorSwatchStyle(part)?.backgroundColor)
    .filter((color): color is string => Boolean(color));
  const uniqueColors = Array.from(new Set(colors));
  if (uniqueColors.length < 2) return undefined;

  const segmentSize = 100 / uniqueColors.length;
  const stops = uniqueColors.flatMap((color, index) => [
    `${color} ${index * segmentSize}%`,
    `${color} ${(index + 1) * segmentSize}%`,
  ]);

  return { backgroundImage: `linear-gradient(135deg, ${stops.join(", ")})` };
}

export function sortColorOptions(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const orderDiff = getColorSortOrder(a) - getColorSortOrder(b);
    if (orderDiff !== 0) return orderDiff;

    return a.localeCompare(b, "ru", { numeric: true, sensitivity: "base" });
  });
}

function getSimSortOrder(value: string): number {
  const normalized = normalizeVariantOption(value);
  const compact = normalized.replace(/\s+/g, "");

  if (normalized.includes("nano") && normalized.includes("esim")) return 0;
  if (/2.*(sim|сим)/i.test(normalized) || compact.includes("2sim")) return 1;
  if (compact.includes("esim") || compact.includes("есим")) return 2;

  return 10;
}

export function sortSimOptions(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const orderDiff = getSimSortOrder(a) - getSimSortOrder(b);
    if (orderDiff !== 0) return orderDiff;

    return a.localeCompare(b, "ru", { numeric: true, sensitivity: "base" });
  });
}

export function getColorSwatchStyle(
  colorName: string,
  fallbackImage?: string,
): ColorSwatchStyle {
  const multiColorStyle = buildMultiColorGradient(colorName);
  if (multiColorStyle) return multiColorStyle;

  const style = findColorSwatchStyle(colorName);
  if (style) return style;
  if (fallbackImage) return { backgroundImage: `url(${fallbackImage})` };
  return { backgroundColor: "#d8dce2" };
}
