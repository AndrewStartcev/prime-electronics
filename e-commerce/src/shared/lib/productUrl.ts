export type ProductUrlSource = {
  id?: string | null;
  slug?: string | null;
};

const cleanUrlSegment = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
};

export const getProductUrl = (product?: ProductUrlSource | null): string => {
  const identifier =
    cleanUrlSegment(product?.slug) || cleanUrlSegment(product?.id);
  return identifier ? `/product/${identifier}` : "/catalog";
};
