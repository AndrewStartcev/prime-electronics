import type { SeoFieldsValue } from "@/shared/ui";

export type SeoVariables = {
  name?: string | null;
  productCount?: number | null;
  minPrice?: number | string | null;
  price?: number | string | null;
};

export type SeoVariableOption = {
  token: string;
  label: string;
};

export const CATEGORY_SEO_VARIABLES: SeoVariableOption[] = [
  { token: "[Название]", label: "Название категории" },
  { token: "[Название страницы]", label: "Название категории" },
  { token: "[Название категории]", label: "Название категории" },
  { token: "[Количество товаров]", label: "Количество товаров" },
  {
    token: "[Минимальная стоимость товара]",
    label: "Минимальная стоимость товара",
  },
  { token: "[Минимальная цена]", label: "Минимальная цена" },
];

export const PRODUCT_SEO_VARIABLES: SeoVariableOption[] = [
  { token: "[Название]", label: "Название товара" },
  { token: "[Название страницы]", label: "Название товара" },
  { token: "[Название товара]", label: "Название товара" },
  { token: "[Стоимость товара]", label: "Стоимость товара" },
  { token: "[Цена]", label: "Стоимость товара" },
];

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

export const resolveSeoFieldsPreview = (
  value: SeoFieldsValue,
  variables: SeoVariables,
): SeoFieldsValue => ({
  seoTitle: replaceSeoTemplateVariables(value.seoTitle, variables),
  seoDescription: replaceSeoTemplateVariables(value.seoDescription, variables),
  seoH1: replaceSeoTemplateVariables(value.seoH1, variables),
});
