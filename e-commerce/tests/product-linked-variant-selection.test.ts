import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveLinkedVariantSelection } from "../src/entities/product/lib/linkedVariantSelection";
import type {
  ProductLinkedVariant,
  ProductVariantConfiguration,
} from "../src/entities/product/model";

const baseVariant = {
  slug: "",
  price: 100,
  isActive: true,
  inStock: true,
} satisfies Partial<ProductLinkedVariant>;

describe("linked product variant selection", () => {
  it("prefers the product explicitly linked from a matching configuration", () => {
    const linkedVariants: ProductLinkedVariant[] = [
      {
        ...baseVariant,
        id: "iphone-black-128",
        color: "Black",
        memory: "128 GB",
        sim: "nano-SIM",
      },
      {
        ...baseVariant,
        id: "iphone-black-256",
        color: "Black",
        memory: "256 GB",
        sim: "nano-SIM",
      },
    ];
    const configurations: ProductVariantConfiguration[] = [
      {
        color: "Black",
        memory: "256 GB",
        sim: "nano-SIM",
        esim: "eSIM",
        price: 129990,
        linkedProductId: "iphone-black-256",
      },
    ];

    const selected = resolveLinkedVariantSelection({
      linkedVariants,
      configurations,
      currentSelection: {
        color: "Black",
        memory: "128 GB",
        sim: "nano-SIM",
        esim: "eSIM",
      },
      nextSelection: { memory: "256 GB" },
    });

    assert.equal(selected?.id, "iphone-black-256");
  });

  it("falls back to an in-stock variant when the exact linked product is unavailable", () => {
    const linkedVariants: ProductLinkedVariant[] = [
      {
        ...baseVariant,
        id: "iphone-blue-256",
        color: "Blue",
        memory: "256 GB",
        sim: "nano-SIM",
        inStock: false,
      },
      {
        ...baseVariant,
        id: "iphone-blue-128",
        color: "Blue",
        memory: "128 GB",
        sim: "nano-SIM",
      },
    ];
    const configurations: ProductVariantConfiguration[] = [
      {
        color: "Blue",
        memory: "256 GB",
        sim: "nano-SIM",
        esim: "eSIM",
        price: 129990,
        linkedProductId: "iphone-blue-256",
      },
    ];

    const selected = resolveLinkedVariantSelection({
      linkedVariants,
      configurations,
      currentSelection: {
        color: "Black",
        memory: "128 GB",
        sim: "nano-SIM",
        esim: "eSIM",
      },
      nextSelection: { color: "Blue", memory: "256 GB" },
    });

    assert.equal(selected?.id, "iphone-blue-128");
  });

  it("uses a linked configuration even when variant fields are missing and SIM formatting differs", () => {
    const linkedVariants: ProductLinkedVariant[] = [
      {
        ...baseVariant,
        id: "iphone-orange-256",
        color: "",
        memory: "",
        sim: "",
      },
    ];
    const configurations: ProductVariantConfiguration[] = [
      {
        color: "Оранжевый",
        memory: "256 ГБ",
        sim: "Nano Sim + eSim",
        esim: "",
        price: 104990,
        linkedProductId: "iphone-orange-256",
      },
    ];

    const selected = resolveLinkedVariantSelection({
      linkedVariants,
      configurations,
      currentSelection: {
        color: "Синий",
        memory: "256 ГБ",
        sim: "nano-SIM+eSIM",
        esim: "",
      },
      nextSelection: { color: "Оранжевый" },
    });

    assert.equal(selected?.id, "iphone-orange-256");
  });
});
