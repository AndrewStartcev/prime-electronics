import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProductVariantConfigurations,
  findProductVariantConfigurationBySelection,
} from "../src/entities/product/lib/variantConfigurations";

describe("product variant configurations", () => {
  it("adds linked product ids to configuration rows from every product in the group", () => {
    const configurations = buildProductVariantConfigurations({
      currentProductId: "blue-product",
      currentAttributes: [
        {
          name: "Конфигурации",
          value:
            '[{"color":"Синий","memory":"256 ГБ","sim":"nano-SIM+eSIM","esim":"","price":106990}]',
        },
      ],
      linkedProducts: [
        {
          id: "blue-product",
          attributes: [
            {
              name: "Конфигурации",
              value:
                '[{"color":"Синий","memory":"256 ГБ","sim":"nano-SIM+eSIM","esim":"","price":106990}]',
            },
          ],
        },
        {
          id: "orange-product",
          attributes: [
            {
              name: "Конфигурации",
              value:
                '[{"color":"Оранжевый","memory":"256 ГБ","sim":"Nano Sim + eSim","esim":"","price":104990}]',
            },
          ],
        },
      ],
    });

    assert.deepEqual(
      configurations.map((config) => ({
        color: config.color,
        price: config.price,
        linkedProductId: config.linkedProductId,
      })),
      [
        {
          color: "Синий",
          price: 106990,
          linkedProductId: "blue-product",
        },
        {
          color: "Оранжевый",
          price: 104990,
          linkedProductId: "orange-product",
        },
      ],
    );
  });

  it("finds the selected linked product configuration with tolerant SIM formatting", () => {
    const configurations = [
      {
        color: "Оранжевый",
        memory: "256 ГБ",
        sim: "Nano Sim + eSim",
        esim: "",
        price: 104990,
        linkedProductId: "orange-product",
      },
      {
        color: "Оранжевый",
        memory: "256 ГБ",
        sim: "eSim + eSim",
        esim: "",
        price: 92990,
        linkedProductId: "orange-product",
      },
    ];

    const selected = findProductVariantConfigurationBySelection(
      configurations,
      "orange-product",
      {
        color: "Оранжевый",
        memory: "256 ГБ",
        sim: "nano-SIM+eSIM",
      },
    );

    assert.equal(selected?.price, 104990);
  });

  it("does not attach another color's configuration rows to the current product", () => {
    const configurations = buildProductVariantConfigurations({
      currentProductId: "blue-product",
      currentProductName: "Apple iPhone 17 Pro Max 256ГБ Синий",
      currentAttributes: [
        { name: "Цвет", value: "Синий" },
        { name: "Цвет", value: "Оранжевый" },
        { name: "Память", value: "256 ГБ" },
        {
          name: "Конфигурации",
          value:
            '[{"color":"Синий","memory":"256 ГБ","sim":"eSIM+eSIM","esim":"","price":92990},{"color":"Оранжевый","memory":"256 ГБ","sim":"eSIM+eSIM","esim":"","price":92990}]',
        },
      ],
      linkedProducts: [
        {
          id: "blue-product",
          name: "Apple iPhone 17 Pro Max 256ГБ Синий",
          attributes: [
            { name: "Цвет", value: "Синий" },
            { name: "Память", value: "256 ГБ" },
            {
              name: "Конфигурации",
              value:
                '[{"color":"Синий","memory":"256 ГБ","sim":"eSIM+eSIM","esim":"","price":92990}]',
            },
          ],
        },
        {
          id: "orange-product",
          name: "Apple iPhone 17 Pro Max 256ГБ Оранжевый",
          attributes: [
            { name: "Цвет", value: "Оранжевый" },
            { name: "Память", value: "256 ГБ" },
            {
              name: "Конфигурации",
              value:
                '[{"color":"Оранжевый","memory":"256 ГБ","sim":"eSIM+eSIM","esim":"","price":92990}]',
            },
          ],
        },
      ],
    });

    const blueOrangeConfig = findProductVariantConfigurationBySelection(
      configurations,
      "blue-product",
      {
        color: "Оранжевый",
        memory: "256 ГБ",
        sim: "eSIM+eSIM",
      },
    );
    const linkedOrangeConfig = findProductVariantConfigurationBySelection(
      configurations,
      "orange-product",
      {
        color: "Оранжевый",
        memory: "256 ГБ",
        sim: "eSIM+eSIM",
      },
    );

    assert.equal(blueOrangeConfig, undefined);
    assert.equal(linkedOrangeConfig?.linkedProductId, "orange-product");
  });

});
