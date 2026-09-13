"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@/shared/ui";
import { useBlogAuthors, useProducts, type BlogProductBlock } from "@/shared/hooks";
import { BLOG_PUBLICATION_TIMEZONE_LABEL } from "@/shared/lib/blogDateTime";

interface Props {
  authorId: string;
  publishedAt: string;
  productBlocks: BlogProductBlock[];
  onAuthorChange: (authorId: string) => void;
  onPublishedAtChange: (value: string) => void;
  onProductBlocksChange: (blocks: BlogProductBlock[]) => void;
}

export function BlogPublishingFields({
  authorId,
  publishedAt,
  productBlocks,
  onAuthorChange,
  onPublishedAtChange,
  onProductBlocksChange,
}: Props) {
  const { data: authors = [] } = useBlogAuthors();
  const [search, setSearch] = useState("");
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);
  const { data: productResults } = useProducts(
    { search, limit: 10, includeInactive: false },
    { enabled: search.trim().length >= 2 && activeBlock !== null },
  );

  const activeIds = useMemo(() => {
    if (activeBlock === null) return new Set<string>();
    return new Set(
      (productBlocks[activeBlock]?.items || []).map((item) => item.productId),
    );
  }, [activeBlock, productBlocks]);

  const updateBlock = (index: number, next: BlogProductBlock) => {
    const blocks = [...productBlocks];
    blocks[index] = next;
    onProductBlocksChange(blocks);
  };

  const addProduct = (blockIndex: number, product: any) => {
    const block = productBlocks[blockIndex];
    if (!block || block.items.some((item) => item.productId === product.id)) return;
    updateBlock(blockIndex, {
      ...block,
      items: [
        ...block.items,
        {
          productId: product.id,
          sortOrder: block.items.length,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            images: product.images,
          },
        },
      ],
    });
  };

  const moveItem = (blockIndex: number, itemIndex: number, direction: -1 | 1) => {
    const block = productBlocks[blockIndex];
    const target = itemIndex + direction;
    if (!block || target < 0 || target >= block.items.length) return;
    const items = [...block.items];
    [items[itemIndex], items[target]] = [items[target], items[itemIndex]];
    updateBlock(blockIndex, {
      ...block,
      items: items.map((item, index) => ({ ...item, sortOrder: index })),
    });
  };

  const getShortcode = (block: BlogProductBlock, blockIndex: number) =>
    `[[product-block:${(block.sortOrder ?? blockIndex) + 1}]]`;

  const copyShortcode = async (block: BlogProductBlock, blockIndex: number) => {
    const shortcode = getShortcode(block, blockIndex);
    await navigator.clipboard.writeText(shortcode);
    setCopiedBlock(blockIndex);
    window.setTimeout(() => setCopiedBlock((value) => value === blockIndex ? null : value), 1500);
  };

  const nextBlockSortOrder = productBlocks.reduce(
    (max, block, index) => Math.max(max, block.sortOrder ?? index),
    -1,
  ) + 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-black mb-2">
            Автор
          </label>
          <select
            value={authorId}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="w-full h-10 px-3 border border-border-gray rounded-lg bg-white"
          >
            <option value="">Без профиля автора (legacy)</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id} disabled={!author.isActive}>
                {author.name}{!author.isActive ? " — выключен" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-secondary-black mt-1">
            Авторы управляются в разделе «Блог → Авторы».
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-black mb-2">
            Дата и время публикации — {BLOG_PUBLICATION_TIMEZONE_LABEL}
          </label>
          <Input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => onPublishedAtChange(e.target.value)}
            required
          />
          <p className="text-xs text-text-secondary-black mt-1">
            Вводится московское время. Будущая дата автоматически делает активную статью запланированной.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-primary-black">Товарные блоки</h3>
            <p className="text-xs text-text-secondary-black mt-1">
              Товары берутся из каталога в момент показа. Шорткод можно вставить в любое место текста статьи.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onProductBlocksChange([
                ...productBlocks,
                {
                  title: "Рекомендуем",
                  placement: "AFTER_ARTICLE",
                  sortOrder: nextBlockSortOrder,
                  items: [],
                },
              ])
            }
          >
            + Добавить блок
          </Button>
        </div>

        {productBlocks.map((block, blockIndex) => {
          const shortcode = getShortcode(block, blockIndex);
          return (
            <div key={block.id || `${block.sortOrder}-${blockIndex}`} className="border border-border-gray rounded-lg p-4 space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Заголовок блока</label>
                  <Input
                    value={block.title || ""}
                    onChange={(e) => updateBlock(blockIndex, { ...block, title: e.target.value })}
                    placeholder="Рекомендуем"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onProductBlocksChange(productBlocks.filter((_, index) => index !== blockIndex));
                    if (activeBlock === blockIndex) setActiveBlock(null);
                  }}
                >
                  Удалить блок
                </Button>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Шорткод блока</label>
                <div className="flex gap-2">
                  <Input value={shortcode} readOnly />
                  <Button type="button" variant="outline" onClick={() => copyShortcode(block, blockIndex)}>
                    {copiedBlock === blockIndex ? "Скопировано" : "Копировать"}
                  </Button>
                </div>
                <p className="text-xs text-text-secondary-black mt-1">
                  Вставьте шорткод отдельной строкой в визуальном или HTML-редакторе. Если шорткод используется в тексте, блок не дублируется после статьи.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Добавить товар</label>
                <Input
                  value={activeBlock === blockIndex ? search : ""}
                  onFocus={() => setActiveBlock(blockIndex)}
                  onChange={(e) => {
                    setActiveBlock(blockIndex);
                    setSearch(e.target.value);
                  }}
                  placeholder="Начните вводить название товара..."
                />
                {activeBlock === blockIndex && search.trim().length >= 2 && (
                  <div className="mt-2 border border-border-gray rounded-lg divide-y bg-white max-h-60 overflow-auto">
                    {(productResults?.data || []).map((product) => (
                      <button
                        type="button"
                        key={product.id}
                        disabled={activeIds.has(product.id)}
                        onClick={() => addProduct(blockIndex, product)}
                        className="w-full text-left px-3 py-2 hover:bg-secondary-gray disabled:opacity-40"
                      >
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="text-xs text-text-secondary-black">
                          {Number(product.price).toLocaleString("ru-RU")} ₽
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {block.items.map((item, itemIndex) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2 rounded-lg bg-secondary-gray px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.product?.name || item.productId}
                      </div>
                      {item.product?.price !== undefined && (
                        <div className="text-xs text-text-secondary-black">
                          {Number(item.product.price).toLocaleString("ru-RU")} ₽
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => moveItem(blockIndex, itemIndex, -1)} disabled={itemIndex === 0}>↑</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => moveItem(blockIndex, itemIndex, 1)} disabled={itemIndex === block.items.length - 1}>↓</Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateBlock(blockIndex, {
                          ...block,
                          items: block.items
                            .filter((_, index) => index !== itemIndex)
                            .map((value, index) => ({ ...value, sortOrder: index })),
                        })
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {block.items.length === 0 && (
                  <p className="text-sm text-text-secondary-black">Товары пока не выбраны.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
