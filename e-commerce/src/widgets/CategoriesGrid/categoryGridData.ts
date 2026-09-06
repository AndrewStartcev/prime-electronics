type CategoryImageSource = {
  slug?: string | null;
  image?: string | null;
};

const DEFAULT_API_ASSET_BASE_URL = (
  process.env.NEXT_PUBLIC_API_ASSET_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "https://api.prime-electronics.ru"
).replace(/\/$/, "");

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  apple: "/images/brands/apple-brand-2026.png",
  samsung: "/images/brands/samsung-category.png",
  xiaomi: "/images/brands/xiaomi.svg",
  dyson: "/images/brands/dyson-brand-2026.png",
  garmin: "/images/brands/garmin.png",
  marshall: "/images/brands/marshall.png",
  dji: "/images/brands/dji.png",
  jbl: "/images/brands/jbl.png",
  pixel: "/images/brands/pixel.png",
  nintendo: "/images/brands/nintendo.png",
  yandeks: "/images/brands/yandeks-category.png",
  yandex: "/images/brands/yandeks-category.png",
  beats: "/images/brands/beats.png",
  sony: "/images/brands/sony-category.jpg",
  oneplus: "/images/brands/oneplus-category.png",
  honor: "/images/brands/honor.png",
  insta360: "/images/brands/insta360.png",
  rayban: "/images/brands/rayban.png",
  whoop: "/images/brands/whoop.png",
};

const PRODUCT_CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  feny: "/images/dyson.png",
  "dyson-gen5": "/images/dyson.png",
  "dyson-airwrap": "/images/dyson.png",
  "dyson-supersonic": "/images/dyson.png",
  "ipad-air-13-m3": "/images/brands/apple-brand-2026.png",
  "ipad-pro-11-m4": "/images/brands/apple-brand-2026.png",
  "ipad-pro-13-m4": "/images/brands/apple-brand-2026.png",
  "ipad-pro-11-m5": "/images/brands/apple-brand-2026.png",
  "ipad-pro-13-m5": "/images/brands/apple-brand-2026.png",
  planshety: "/images/brands/apple-brand-2026.png",
  "planshety-1": "/images/brands/apple-brand-2026.png",
  "planshety-apple-ipad": "/images/brands/apple-brand-2026.png",
  noutbuki: "/images/macbook.png",
  "noutbuki-apple": "/images/macbook.png",
  naushniki: "/images/headphones.png",
  smartfony: "/images/iphone17.png",
  "smartfony-apple-iphone": "/images/iphone17.png",
};

export function shouldEnableCategoryTreeQuery(
  _initialCategories?: unknown[],
) {
  return true;
}

export function resolveCategoryCardImage(
  category: CategoryImageSource,
  apiAssetBaseUrl = DEFAULT_API_ASSET_BASE_URL,
): string | undefined {
  const slug = category.slug?.trim();
  if (slug) {
    const mappedImage =
      CATEGORY_IMAGE_MAP[slug] || PRODUCT_CATEGORY_IMAGE_FALLBACKS[slug];
    if (mappedImage) return mappedImage;
  }

  const rawImage = category.image?.trim();
  if (!rawImage) {
    return undefined;
  }

  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    return rawImage;
  }

  if (rawImage.startsWith("/images/categories/brands/")) {
    const fileName = rawImage.split("/").pop();
    if (fileName) {
      const normalizedFileName =
        fileName === "yandex.png" ? "yandeks-category.png" : fileName;
      return `/images/brands/${normalizedFileName}`;
    }
  }

  if (rawImage.startsWith("/images/brands/")) {
    return rawImage;
  }

  if (rawImage.startsWith("/")) {
    return `${apiAssetBaseUrl}${rawImage}`;
  }

  return rawImage;
}
