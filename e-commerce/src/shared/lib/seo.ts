export type SeoVariables = {
  name?: string | null;
  productCount?: number | null;
  minPrice?: number | string | null;
  price?: number | string | null;
};

export type ResolveSeoTextInput = {
  manual?: string | null;
  template?: string | null;
  fallbackTitle?: string | null;
  defaultValue?: string | null;
  variables?: SeoVariables;
};

const trimText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const formatSeoValue = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(numeric));
};

export const replaceSeoTemplateVariables = (
  template: string,
  variables: SeoVariables = {},
): string => {
  const replacements: Record<string, string> = {
    "[Название]": variables.name?.trim() || "",
    "[Название страницы]": variables.name?.trim() || "",
    "[Название категории]": variables.name?.trim() || "",
    "[Название товара]": variables.name?.trim() || "",
    "[Количество товаров]":
      variables.productCount === null || variables.productCount === undefined
        ? ""
        : String(variables.productCount),
    "[Минимальная стоимость товара]": formatSeoValue(variables.minPrice),
    "[Минимальная цена]": formatSeoValue(variables.minPrice),
    "[Стоимость товара]": formatSeoValue(variables.price),
    "[Цена]": formatSeoValue(variables.price),
  };

  return Object.entries(replacements).reduce(
    (result, [token, value]) => result.split(token).join(value),
    template,
  );
};

export const resolveSeoText = ({
  manual,
  template,
  fallbackTitle,
  defaultValue,
  variables,
}: ResolveSeoTextInput): string => {
  const resolveText = (value?: string | null): string | null => {
    const text = trimText(value);
    return text ? trimText(replaceSeoTemplateVariables(text, variables)) : null;
  };

  const manualText = resolveText(manual);
  if (manualText) return manualText;

  const templateText = resolveText(template);
  if (templateText) return templateText;

  return trimText(fallbackTitle) || trimText(defaultValue) || "";
};

export function resolveProductDocumentTitle({
  name,
  price,
  seoTitle,
  titleTemplate,
}: {
  name: string;
  price: number | string;
  seoTitle?: string | null;
  titleTemplate?: string | null;
}): string {
  return resolveSeoText({
    manual: seoTitle,
    template: titleTemplate,
    fallbackTitle: name,
    variables: { name, price },
  });
}
