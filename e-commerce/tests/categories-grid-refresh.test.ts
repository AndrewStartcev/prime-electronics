import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveCategoryCardImage,
  shouldEnableCategoryTreeQuery,
} from "../src/widgets/CategoriesGrid/categoryGridData.ts";

describe("categories grid data", () => {
  it("keeps the category tree query enabled when server initial data exists", () => {
    assert.equal(shouldEnableCategoryTreeQuery([]), true);
  });

  it("uses a product-category fallback image when API category image is empty", () => {
    assert.equal(
      resolveCategoryCardImage({
        slug: "feny",
        image: null,
      }),
      "/images/dyson.png",
    );
  });
});
