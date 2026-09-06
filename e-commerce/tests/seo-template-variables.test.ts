import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  replaceSeoTemplateVariables,
  resolveProductDocumentTitle,
  resolveSeoText,
} from "../src/shared/lib/seo.ts";

describe("SEO template variables", () => {
  it("resolves category variables in a manually configured SEO field", () => {
    const result = resolveSeoText({
      manual:
        "[Название категории]: [Количество товаров] товаров от [Минимальная цена] ₽",
      variables: {
        name: "iPhone",
        productCount: 18,
        minPrice: 69990,
      },
    });

    assert.equal(result, "iPhone: 18 товаров от 69\u00a0990 ₽");
  });

  it("resolves product variables in a manually configured SEO field", () => {
    const result = resolveSeoText({
      manual: "[Название товара] купить за [Цена] ₽",
      variables: {
        name: "iPhone 17 Pro",
        price: 129990,
      },
    });

    assert.equal(result, "iPhone 17 Pro купить за 129\u00a0990 ₽");
  });

  it("keeps the existing priority of manual SEO, template, and fallback values", () => {
    assert.equal(
      resolveSeoText({
        manual: "[Название] в наличии",
        template: "Купить [Название]",
        fallbackTitle: "iPhone",
        variables: { name: "iPhone 17" },
      }),
      "iPhone 17 в наличии",
    );

    assert.equal(
      resolveSeoText({
        template: "Купить [Название]",
        fallbackTitle: "iPhone",
        variables: { name: "iPhone 17" },
      }),
      "Купить iPhone 17",
    );

    assert.equal(
      resolveSeoText({ fallbackTitle: "iPhone" }),
      "iPhone",
    );
  });

  it("uses the same aliases as the global SEO templates", () => {
    assert.equal(
      replaceSeoTemplateVariables("[Название страницы] - [Стоимость товара] ₽", {
        name: "iPhone 17",
        price: 89990,
      }),
      "iPhone 17 - 89\u00a0990 ₽",
    );
  });

  it("keeps the product Title template after client hydration and variant changes", () => {
    assert.equal(
      resolveProductDocumentTitle({
        name: "iPhone 17 Pro 256 ГБ",
        price: 129990,
        seoTitle: "",
        titleTemplate: "[Название товара] купить за [Стоимость товара] ₽",
      }),
      "iPhone 17 Pro 256 ГБ купить за 129\u00a0990 ₽",
    );
  });
});
