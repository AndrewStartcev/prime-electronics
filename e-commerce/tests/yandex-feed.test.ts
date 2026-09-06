const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const {
  buildFeedCategories,
  renderCategories,
  renderOffer,
} = require("../src/app/yandex-feed.xml/route.ts");

const rootCategoryId = "08072e80-92c7-42ac-b916-0b6a6d59e8bb";
const childCategoryId = "2a5c2d3b-5d14-4153-add6-75c43f66560e";

describe("Yandex feed categories", () => {
  it("converts UUID categories to unique positive IDs of at most 18 digits", () => {
    const categories = buildFeedCategories([
      { id: childCategoryId, parentId: rootCategoryId, title: "Смартфоны" },
      { id: rootCategoryId, title: "Apple" },
    ]);

    assert.equal(categories.length, 2);
    assert.ok(categories.every((category: { id: string }) => /^[1-9]\d{0,17}$/.test(category.id)));
    assert.equal(new Set(categories.map((category: { id: string }) => category.id)).size, 2);
    assert.equal(categories[0].sourceId, rootCategoryId);
    assert.equal(categories[1].parentId, categories[0].id);
  });

  it("uses the generated category ID in every offer", () => {
    const categories = buildFeedCategories([
      { id: rootCategoryId, title: "Apple" },
    ]);
    const ids = new Map(categories.map((category: { sourceId: string; id: string }) => [category.sourceId, category.id]));
    const offer = renderOffer(
      {
        id: "product-108910",
        name: "iPhone 17 Pro",
        slug: "iphone-17-pro",
        price: "129990",
        oldPrice: null,
        description: null,
        isActive: true,
        categories: [
          {
            id: "product-category-1",
            productId: "product-108910",
            categoryId: rootCategoryId,
            isPrimary: true,
            category: { id: rootCategoryId, title: "Apple", slug: "apple" },
          },
        ],
        images: [],
        totalStock: 1,
      },
      ids,
    );

    assert.match(offer || "", new RegExp(`<categoryId>${categories[0].id}</categoryId>`));
    assert.doesNotMatch(offer || "", new RegExp(rootCategoryId));
  });

  it("does not publish offers without a category from the feed tree", () => {
    const offer = renderOffer(
      {
        id: "product-108911",
        name: "iPhone 17",
        slug: "iphone-17",
        price: "99990",
        oldPrice: null,
        description: null,
        isActive: true,
        categories: [],
        images: [],
        totalStock: 1,
      },
      new Map(),
    );

    assert.equal(offer, null);
  });

  it("renders a tree without invalid XML control characters", () => {
    const categories = buildFeedCategories([
      { id: rootCategoryId, title: "Apple\u0001" },
    ]);

    assert.doesNotMatch(renderCategories(categories), /\u0001/);
  });
});
