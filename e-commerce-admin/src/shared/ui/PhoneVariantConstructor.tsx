"use client";

import { useMemo, useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect";
import { PhoneVariantOptions, type ProductVariantSummary } from "@/shared/lib";

type LinkedProductOption = SearchableSelectOption & {
  variantSummary?: ProductVariantSummary;
  price?: string | number | null;
  oldPrice?: string | number | null;
};

interface PhoneVariantConstructorProps {
  value: PhoneVariantOptions;
  onChange: (next: PhoneVariantOptions) => void;
  basePrice?: string | number | null;
  baseOldPrice?: string | number | null;
  linkedProductOptions?: LinkedProductOption[];
  compact?: boolean;
}

type VariantField = "colors" | "memories" | "sim" | "esim";

type VariantFieldConfig = {
  key: VariantField;
  title: string;
  placeholder: string;
  helperText: string;
  suggestions?: string[];
};

const FIELD_CONFIGS: VariantFieldConfig[] = [
  {
    key: "colors",
    title: "Цвета",
    placeholder: "Например: Black",
    helperText: "Добавьте все доступные цвета",
  },
  {
    key: "memories",
    title: "Память",
    placeholder: "Например: 256 ГБ",
    helperText: "Добавьте варианты памяти",
  },
  {
    key: "sim",
    title: "SIM",
    placeholder: "Например: 1 SIM",
    helperText: "Добавьте варианты для физической SIM",
    suggestions: ["1 SIM", "2 SIM"],
  },
  {
    key: "esim",
    title: "eSIM",
    placeholder: "Например: Да",
    helperText: "Добавьте варианты eSIM (Да/Нет или другой формат)",
    suggestions: ["eSIM", "Без eSIM"],
  },
];

const CONFIG_LIMIT = 300;

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(trimmed);
  });

  return result;
}

function splitOptionInput(value: string): string[] {
  return value
    .split(/[\n;,|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeKeyPart(value: string): string {
  return value.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function getConfigurationKey(config: {
  color: string;
  memory: string;
  sim: string;
  esim: string;
}) {
  return [
    normalizeKeyPart(config.color),
    normalizeKeyPart(config.memory),
    normalizeKeyPart(config.sim),
    normalizeKeyPart(config.esim),
  ].join("::");
}

function formatPriceForInput(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "";

  const normalized = String(value)
    .replace(/\u00A0/g, "")
    .replace(/\s+/g, "")
    .replace(/₽|руб\.?/gi, "")
    .replace(",", ".")
    .trim();

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return "";

  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
}

export function PhoneVariantConstructor({
  value,
  onChange,
  basePrice,
  baseOldPrice,
  linkedProductOptions = [],
  compact = false,
}: PhoneVariantConstructorProps) {
  const [drafts, setDrafts] = useState<Record<VariantField, string>>({
    colors: "",
    memories: "",
    sim: "",
    esim: "",
  });
  const [bulkPrice, setBulkPrice] = useState("");

  const totalOptions = useMemo(
    () =>
      value.colors.length +
      value.memories.length +
      value.sim.length +
      value.esim.length +
      value.configurations.length,
    [value],
  );

  const basePriceValue = formatPriceForInput(basePrice);
  const baseOldPriceValue = formatPriceForInput(baseOldPrice);
  const missingPriceCount = value.configurations.filter(
    (config) => !formatPriceForInput(config.price),
  ).length;
  const shouldShowLinkedProductColumn =
    linkedProductOptions.length > 0 ||
    value.configurations.some((config) => Boolean(config.linkedProductId));
  const linkedProductById = useMemo(
    () => new Map(linkedProductOptions.map((option) => [option.value, option])),
    [linkedProductOptions],
  );

  const addOptions = (field: VariantField, rawValue: string) => {
    const values = splitOptionInput(rawValue);
    if (values.length === 0) return;

    onChange({
      ...value,
      [field]: dedupe([...value[field], ...values]),
    });

    setDrafts((prev) => ({ ...prev, [field]: "" }));
  };

  const addOption = (field: VariantField) => {
    addOptions(field, drafts[field]);
  };

  const removeOption = (field: VariantField, index: number) => {
    onChange({
      ...value,
      [field]: value[field].filter((_, idx) => idx !== index),
    });
  };

  const addConfiguration = () => {
    onChange({
      ...value,
      configurations: [
        ...value.configurations,
        {
          color: value.colors[0] || "",
          memory: value.memories[0] || "",
          sim: value.sim[0] || "",
          esim: value.esim[0] || "",
          price: "",
          oldPrice: "",
          linkedProductId: "",
        },
      ],
    });
  };

  const removeConfiguration = (index: number) => {
    onChange({
      ...value,
      configurations: value.configurations.filter((_, idx) => idx !== index),
    });
  };

  const updateConfiguration = (
    index: number,
    field:
      | "color"
      | "memory"
      | "sim"
      | "esim"
      | "price"
      | "oldPrice"
      | "linkedProductId",
    fieldValue: string,
  ) => {
    onChange({
      ...value,
      configurations: value.configurations.map((config, idx) =>
        idx === index ? { ...config, [field]: fieldValue } : config,
      ),
    });
  };

  const updateConfigurationLinkedProduct = (
    index: number,
    productId: string,
  ) => {
    const linkedProduct = linkedProductById.get(productId);
    const summary = linkedProduct?.variantSummary;

    onChange({
      ...value,
      configurations: value.configurations.map((config, idx) =>
        idx === index
          ? {
              ...config,
              linkedProductId: productId,
              color: summary?.color || config.color,
              memory: summary?.memory || config.memory,
              sim: summary?.sim || config.sim,
              price:
                formatPriceForInput(linkedProduct?.price) || config.price,
              oldPrice:
                formatPriceForInput(linkedProduct?.oldPrice) ||
                config.oldPrice,
            }
          : config,
      ),
    });
  };

  const generateConfigurations = () => {
    const colors = value.colors.length > 0 ? value.colors : [""];
    const memories = value.memories.length > 0 ? value.memories : [""];
    const sims = value.sim.length > 0 ? value.sim : [""];
    const esims = value.esim.length > 0 ? value.esim : [""];
    const existingByKey = new Map(
      value.configurations.map((config) => [getConfigurationKey(config), config]),
    );

    const generated = [];
    for (const color of colors) {
      for (const memory of memories) {
        for (const sim of sims) {
          for (const esim of esims) {
            const nextConfig = {
              color,
              memory,
              sim,
              esim,
            };
            const existing = existingByKey.get(getConfigurationKey(nextConfig));
            generated.push(
              existing || {
                ...nextConfig,
                price: basePriceValue,
                oldPrice: baseOldPriceValue,
              },
            );
            if (generated.length >= CONFIG_LIMIT) break;
          }
          if (generated.length >= CONFIG_LIMIT) break;
        }
        if (generated.length >= CONFIG_LIMIT) break;
      }
      if (generated.length >= CONFIG_LIMIT) break;
    }

    onChange({
      ...value,
      configurations: generated,
    });
  };

  const fillPrices = (mode: "empty" | "all") => {
    if (!basePriceValue) return;

    onChange({
      ...value,
      configurations: value.configurations.map((config) => ({
        ...config,
        price:
          mode === "all" || !formatPriceForInput(config.price)
            ? basePriceValue
            : config.price,
        oldPrice:
          baseOldPriceValue &&
          (mode === "all" || !formatPriceForInput(config.oldPrice))
            ? baseOldPriceValue
            : config.oldPrice,
      })),
    });
  };

  const applyBulkPrice = (mode: "empty" | "all") => {
    const normalizedPrice = formatPriceForInput(bulkPrice);
    if (!normalizedPrice) return;

    onChange({
      ...value,
      configurations: value.configurations.map((config) => ({
        ...config,
        price:
          mode === "all" || !formatPriceForInput(config.price)
            ? normalizedPrice
            : config.price,
      })),
    });
  };

  const inputClassName = compact
    ? "rounded-lg px-3 py-2.5 text-sm"
    : undefined;
  const optionFields = (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {FIELD_CONFIGS.map((field) => (
        <div key={field.key} className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              label={field.title}
              placeholder={field.placeholder}
              helperText={compact ? undefined : field.helperText}
              value={drafts[field.key]}
              className={inputClassName}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [field.key]: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                addOption(field.key);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={compact ? "self-end h-[38px] rounded-lg px-3" : "self-end h-[42px]"}
              onClick={() => addOption(field.key)}
            >
              Добавить
            </Button>
          </div>
          {!compact && (
            <p className="text-[11px] text-text-secondary-black">
              Можно вставить несколько значений через запятую, точку с запятой
              или с новой строки.
            </p>
          )}

          {field.suggestions && field.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {field.suggestions.map((suggestion) => (
                <button
                  key={`${field.key}-${suggestion}`}
                  type="button"
                  onClick={() => addOptions(field.key, suggestion)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-primary-black hover:border-primary-orange hover:text-primary-orange transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}

          {value[field.key].length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {value[field.key].map((item, idx) => (
                <span
                  key={`${field.key}-${item}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeOption(field.key, idx)}
                    className="text-gray-500 hover:text-red-600 leading-none"
                    aria-label={`Удалить ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary-black">
              Конструктор цветов / памяти / SIM / eSIM
            </p>
            <p className="text-xs text-text-secondary-black mt-1">
              Для товаров типа телефонов. Эти значения сохраняются в атрибутах
              товара.
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg bg-secondary-gray text-text-secondary-black">
            Опций: {totalOptions}
          </span>
        </div>
      )}

      {compact ? (
        <details className="rounded-lg border border-gray-200 bg-gray-50/70">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium text-primary-black">
            <span>Параметры генерации</span>
            <span className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-text-secondary-black">
              {totalOptions} опций
            </span>
          </summary>
          <div className="border-t border-gray-200 p-3">{optionFields}</div>
        </details>
      ) : (
        optionFields
      )}

      <div
        className={
          compact
            ? "border border-gray-200 rounded-lg bg-white p-3 space-y-3"
            : "border border-gray-200 rounded-xl p-3 space-y-3"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-primary-black">
              {compact ? "Строки конфигураций" : "Цены по конфигурациям"}
            </p>
            <p className="text-xs text-text-secondary-black mt-1">
              {compact
                ? "Быстрое обновление цен без перехода в полное редактирование."
                : shouldShowLinkedProductColumn
                  ? "Для каждой комбинации можно задать цену и привязать конкретное объявление из группы."
                  : "Для каждой комбинации цвета / памяти / SIM / eSIM можно задать отдельную цену. При повторной генерации уже введенные цены сохраняются."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={compact ? "rounded-lg px-3" : undefined}
              onClick={generateConfigurations}
            >
              {compact ? "Сгенерировать" : "Сгенерировать комбинации"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={compact ? "rounded-lg px-3" : undefined}
              onClick={addConfiguration}
            >
              {compact ? "Строка" : "Добавить строку"}
            </Button>
          </div>
        </div>

        <div
          className={
            compact
              ? "grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-2"
              : "grid grid-cols-1 gap-2 rounded-xl bg-gray-50 p-3 lg:grid-cols-[1fr_auto_auto]"
          }
        >
          <Input
            type="number"
            min="0"
            placeholder={basePriceValue || "Цена для строк"}
            value={bulkPrice}
            className={inputClassName}
            onChange={(e) => setBulkPrice(e.target.value)}
            helperText={
              missingPriceCount > 0
                ? `Без цены: ${missingPriceCount}`
                : "Все строки с ценой"
            }
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={
              compact ? "w-full rounded-lg" : "self-start lg:self-center"
            }
            onClick={() => applyBulkPrice("empty")}
            disabled={!formatPriceForInput(bulkPrice)}
          >
            Заполнить пустые
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={
              compact ? "w-full rounded-lg" : "self-start lg:self-center"
            }
            onClick={() => applyBulkPrice("all")}
            disabled={!formatPriceForInput(bulkPrice)}
          >
            Применить ко всем
          </Button>
        </div>

        {basePriceValue && value.configurations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={compact ? "rounded-lg" : undefined}
              onClick={() => fillPrices("empty")}
            >
              Пустые = цена товара ({basePriceValue} ₽)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={compact ? "rounded-lg" : undefined}
              onClick={() => fillPrices("all")}
            >
              Все = цена товара
            </Button>
          </div>
        )}

        {value.configurations.length === 0 ? (
          <p className="text-xs text-text-secondary-black">
            Пока нет цен по конфигурациям. Сгенерируйте варианты или добавьте
            строку вручную.
          </p>
        ) : (
          <div className="space-y-2">
            {!compact && (
              shouldShowLinkedProductColumn ? (
                <div className="hidden lg:grid lg:grid-cols-[minmax(220px,1.2fr)_minmax(260px,1fr)_46px] gap-2 text-xs text-text-secondary-black px-1">
                  <span>Связанный товар</span>
                  <span>Параметры и цена из товара</span>
                  <span />
                </div>
              ) : (
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1fr_1fr_140px_140px_46px] gap-2 text-xs text-text-secondary-black px-1">
                  <span>Цвет</span>
                  <span>Память</span>
                  <span>SIM</span>
                  <span>eSIM</span>
                  <span>Цена</span>
                  <span>Старая цена</span>
                  <span />
                </div>
              )
            )}

            {value.configurations.map((config, index) => {
              const linkedProduct = linkedProductById.get(
                config.linkedProductId || "",
              );
              const summary = linkedProduct?.variantSummary;
              const showLinkedProductSummary = Boolean(
                shouldShowLinkedProductColumn && linkedProduct,
              );

              return (
                <div
                  key={`config-${index}`}
                  className={
                    compact
                      ? "grid grid-cols-2 gap-2 items-start rounded-lg border border-gray-100 bg-white p-2"
                      : showLinkedProductSummary
                        ? "grid grid-cols-1 lg:grid-cols-[minmax(220px,1.2fr)_minmax(260px,1fr)_46px] gap-2 items-start rounded-lg border border-gray-100 p-2"
                        : shouldShowLinkedProductColumn
                          ? "grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_minmax(180px,1.3fr)_120px_120px_46px] gap-2 items-start rounded-lg border border-gray-100 p-2"
                          : "grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_140px_140px_46px] gap-2 items-start rounded-lg border border-gray-100 p-2"
                  }
                >
                  {showLinkedProductSummary ? (
                    <>
                      <SearchableSelect
                        value={config.linkedProductId || ""}
                        options={linkedProductOptions}
                        onChange={(productId) =>
                          updateConfigurationLinkedProduct(index, productId)
                        }
                        placeholder="Выбрать товар"
                        emptyLabel="Товар не найден"
                        emptyValueLabel="Без привязки"
                        emptyOptionLabel="Без привязки"
                        emptyOptionDescription="Вернуть ручные поля строки"
                        disabled={linkedProductOptions.length === 0}
                        showImages
                        className={compact ? "col-span-2" : undefined}
                      />
                      <div className={compact ? "col-span-2" : ""}>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-text-secondary-black">
                          <div className="flex flex-wrap gap-1.5">
                            {summary?.color && (
                              <span className="rounded-full bg-white px-2 py-1">
                                {summary.color}
                              </span>
                            )}
                            {summary?.memory && (
                              <span className="rounded-full bg-white px-2 py-1">
                                {summary.memory}
                              </span>
                            )}
                            {summary?.sim && (
                              <span className="rounded-full bg-white px-2 py-1">
                                {summary.sim}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 font-medium text-primary-black">
                            {summary?.price || "Цена не указана"}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input
                        placeholder="Цвет"
                        value={config.color}
                        className={inputClassName}
                        onChange={(e) =>
                          updateConfiguration(index, "color", e.target.value)
                        }
                        list="variant-colors-list"
                      />
                      <Input
                        placeholder="Память"
                        value={config.memory}
                        className={inputClassName}
                        onChange={(e) =>
                          updateConfiguration(index, "memory", e.target.value)
                        }
                        list="variant-memory-list"
                      />
                      <Input
                        placeholder="SIM"
                        value={config.sim}
                        className={inputClassName}
                        onChange={(e) =>
                          updateConfiguration(index, "sim", e.target.value)
                        }
                        list="variant-sim-list"
                      />
                      <Input
                        placeholder="eSIM"
                        value={config.esim}
                        className={inputClassName}
                        onChange={(e) =>
                          updateConfiguration(index, "esim", e.target.value)
                        }
                        list="variant-esim-list"
                      />
                      {shouldShowLinkedProductColumn && (
                        <SearchableSelect
                          value={config.linkedProductId || ""}
                          options={linkedProductOptions}
                          onChange={(productId) =>
                            updateConfigurationLinkedProduct(index, productId)
                          }
                          placeholder="Выбрать товар"
                          emptyLabel="Товар не найден"
                          emptyValueLabel="Без привязки"
                          emptyOptionLabel="Без привязки"
                          emptyOptionDescription="Цена останется только локальной для строки"
                          disabled={linkedProductOptions.length === 0}
                          showImages
                          className={compact ? "col-span-2" : undefined}
                        />
                      )}
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={config.price}
                        className={inputClassName}
                        onChange={(e) =>
                          updateConfiguration(index, "price", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={config.oldPrice}
                        className={inputClassName}
                        onChange={(e) =>
                          updateConfiguration(index, "oldPrice", e.target.value)
                        }
                      />
                    </>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      compact
                        ? "col-span-2 h-[38px] rounded-lg px-0"
                        : "h-[46px] px-0"
                    }
                    onClick={() => removeConfiguration(index)}
                    aria-label="Удалить конфигурацию"
                  >
                    ×
                  </Button>
                </div>
              );
            })}

            <datalist id="variant-colors-list">
              {value.colors.map((item, idx) => (
                <option key={`${item}-${idx}`} value={item} />
              ))}
            </datalist>
            <datalist id="variant-memory-list">
              {value.memories.map((item, idx) => (
                <option key={`${item}-${idx}`} value={item} />
              ))}
            </datalist>
            <datalist id="variant-sim-list">
              {value.sim.map((item, idx) => (
                <option key={`${item}-${idx}`} value={item} />
              ))}
            </datalist>
            <datalist id="variant-esim-list">
              {value.esim.map((item, idx) => (
                <option key={`${item}-${idx}`} value={item} />
              ))}
            </datalist>
          </div>
        )}
      </div>
    </div>
  );
}
