import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVariantAttributes,
  getProductVariantOptionLabel,
  getProductVariantSummary,
  splitVariantAndOtherAttributes,
} from "../src/shared/lib/productVariants";

describe("phone variant configurations", () => {
  it("keeps linked product ids when saving and reading configuration rows", () => {
    const attributes = buildVariantAttributes({
      colors: ["Black"],
      memories: ["256 GB"],
      sim: ["nano-SIM"],
      esim: ["eSIM"],
      configurations: [
        {
          color: "Black",
          memory: "256 GB",
          sim: "nano-SIM",
          esim: "eSIM",
          price: "129990",
          oldPrice: "",
          linkedProductId: "product-iphone-15-black-256",
        },
      ],
    });

    const configurationAttribute = attributes.find(
      (attribute) => attribute.name === "Конфигурации",
    );
    assert.ok(configurationAttribute);

    const storedConfigurations = JSON.parse(configurationAttribute.value);
    assert.equal(
      storedConfigurations[0].linkedProductId,
      "product-iphone-15-black-256",
    );

    const parsed = splitVariantAndOtherAttributes(attributes);
    assert.equal(
      parsed.variantOptions.configurations[0].linkedProductId,
      "product-iphone-15-black-256",
    );
  });

  it("prefers actual attributes and product name over stale variant fields", () => {
    const summary = getProductVariantSummary({
      name: 'Смартфон Apple iPhone 17 Pro Max 256ГБ Оранжевый',
      variantColor: "Черный",
      variantMemory: "142",
      variantSim: "nano",
      price: "92990",
      attributes: [
        { name: "Цвет", value: "Оранжевый" },
        { name: "Память", value: "256 ГБ" },
        { name: "SIM", value: "Nano Sim + eSim" },
        { name: "SIM", value: "eSim + eSim" },
      ],
    });

    assert.equal(summary.color, "Оранжевый");
    assert.equal(summary.memory, "256 ГБ");
    assert.equal(summary.sim, "Nano Sim + eSim / eSim + eSim");
    assert.equal(summary.price, "92 990 ₽");
    assert.equal(
      getProductVariantOptionLabel(summary),
      "Оранжевый / 256 ГБ / Nano Sim + eSim / eSim + eSim",
    );
  });
});
