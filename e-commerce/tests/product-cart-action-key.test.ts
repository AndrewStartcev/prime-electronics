import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getProductCartActionKey } from "../src/entities/product/lib/cartActionKey";

describe("product cart action key", () => {
  it("changes when the selected SIM configuration changes", () => {
    assert.notEqual(
      getProductCartActionKey("product-108919", {
        variantKey: "orange|256-gb|nano-sim-esim|",
      }),
      getProductCartActionKey("product-108919", {
        variantKey: "orange|256-gb|esim-esim|",
      }),
    );
  });

  it("falls back to the product id when no variant is selected", () => {
    assert.equal(getProductCartActionKey("product-108919"), "product-108919::");
  });
});
