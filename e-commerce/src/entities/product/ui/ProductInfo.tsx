"use client";

import { memo, useState } from "react";
import { Rating, StockBadge, Divider } from "@/shared/ui";
import { ProductDetail, ProductVariantConfiguration } from "../model";
import { useProductSelection } from "../hooks";
import { ColorSelector } from "./ColorSelector";
import { StorageSelector } from "./StorageSelector";
import { ModificationSelector } from "./ModificationSelector";
import { ProductPrice } from "./ProductPrice";
import { DeliveryInfo } from "./DeliveryInfo";
import { ProductActions } from "./ProductActions";
import { ProductActionIcons } from "./ProductActionIcons";
import { resolveLinkedVariantSelection } from "../lib/linkedVariantSelection";
import {
  normalizeVariantOption,
  type ProductVariantSelection,
} from "../lib/variantConfigurations";

interface ProductInfoProps {
  product: ProductDetail;
  heading?: string;
  onModificationSelect: (optionId: string) => void;
  onLinkedVariantSelect?: (
    productId: string,
    selection: ProductVariantSelection,
  ) => void;
}

export const ProductInfo = memo(
  ({
    product,
    heading,
    onModificationSelect,
    onLinkedVariantSelect,
  }: ProductInfoProps) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const {
      selectedColor,
      selectedStorage,
      selectedSim,
      selectedEsim,
      selectColor,
      selectStorage,
      selectSim,
      selectEsim,
    } = useProductSelection({
      defaultColor: product.selectedColor,
      defaultStorage: product.selectedStorage,
      defaultSim: product.selectedSim || "",
      defaultEsim: product.selectedEsim || "",
    });

    const selectedColorName =
      product.colors.find((c) => c.id === selectedColor)?.name || "";
    const linkedVariants = product.linkedVariants || [];
    const hasLinkedVariants = linkedVariants.length > 1;

    const configurations = (product.variantConfigurations ||
      []) as ProductVariantConfiguration[];
    const normalize = normalizeVariantOption;
    const normalizeVariantKeyPart = (value: string) =>
      normalize(value).replace(/\s+/g, " ");
    const getVariantKey = (config: ProductVariantConfiguration) =>
      [
        normalizeVariantKeyPart(config.color),
        normalizeVariantKeyPart(config.memory),
        normalizeVariantKeyPart(config.sim),
        normalizeVariantKeyPart(config.esim),
      ].join("::");
    const getVariantLabel = (config: ProductVariantConfiguration) =>
      [config.memory, config.color, config.sim, config.esim]
        .map((value) => value?.trim())
        .filter(Boolean)
        .join(" / ");
    const selected = {
      color: normalize(selectedColorName),
      memory: normalize(selectedStorage),
      sim: normalize(selectedSim),
      esim: normalize(selectedEsim),
    };
    const getRequestedSelection = (
      nextSelection: ProductVariantSelection,
    ): ProductVariantSelection => ({
      color: nextSelection.color ?? selectedColorName,
      memory: nextSelection.memory ?? selectedStorage,
      sim: nextSelection.sim ?? selectedSim,
      esim: nextSelection.esim ?? selectedEsim,
    });
    const findLinkedVariant = (nextSelection: ProductVariantSelection) => {
      if (!hasLinkedVariants) return null;

      return resolveLinkedVariantSelection({
        linkedVariants,
        configurations,
        currentSelection: {
          color: selectedColorName,
          memory: selectedStorage,
          sim: selectedSim,
          esim: selectedEsim,
        },
        nextSelection,
      });
    };
    const selectLinkedVariant = (nextSelection: ProductVariantSelection) => {
      const variant = findLinkedVariant(nextSelection);
      if (variant && variant.id !== product.id) {
        onLinkedVariantSelect?.(variant.id, getRequestedSelection(nextSelection));
      }
    };
    const handleColorSelect = (colorId: string) => {
      selectColor(colorId);
      const colorName = product.colors.find((color) => color.id === colorId)?.name;
      if (colorName) {
        selectLinkedVariant({ color: colorName });
      }
    };
    const handleStorageSelect = (memory: string) => {
      selectStorage(memory);
      selectLinkedVariant({ memory });
    };
    const handleSimSelect = (sim: string) => {
      selectSim(sim);
      selectLinkedVariant({ sim });
    };
    const handleEsimSelect = (esim: string) => {
      selectEsim(esim);
      selectLinkedVariant({ esim });
    };

    let selectedConfiguration: ProductVariantConfiguration | null = null;
    let bestScore = -1;

    for (const config of configurations) {
      const color = normalize(config.color);
      const memory = normalize(config.memory);
      const sim = normalize(config.sim);
      const esim = normalize(config.esim);

      if (color && selected.color && color !== selected.color) continue;
      if (memory && selected.memory && memory !== selected.memory) continue;
      if (sim && selected.sim && sim !== selected.sim) continue;
      if (esim && selected.esim && esim !== selected.esim) continue;

      const score =
        Number(Boolean(color)) +
        Number(Boolean(memory)) +
        Number(Boolean(sim)) +
        Number(Boolean(esim));

      if (score > bestScore) {
        bestScore = score;
        selectedConfiguration = config;
      }
    }

    const displayedPrice = selectedConfiguration?.price ?? product.price;
    const displayedOldPrice =
      selectedConfiguration?.oldPrice ?? product.oldPrice;
    const selectedVariant = selectedConfiguration
      ? {
          variantKey: getVariantKey(selectedConfiguration),
          variantLabel: getVariantLabel(selectedConfiguration),
        }
      : undefined;
    const showModificationOptions =
      !hasLinkedVariants && (product.modificationOptions?.length ?? 0) > 1;
    const showStaticSimEsim =
      !showModificationOptions &&
      Boolean(product.simEsimDisplay) &&
      (product.simOptions?.length ?? 0) === 0 &&
      (product.esimOptions?.length ?? 0) === 0;

    return (
      <div className="flex flex-col gap-[14px] md:gap-[18px] lg:gap-[16px] xl:gap-[20px] 2xl:gap-[24px] w-full">
        <div className="flex items-start justify-between gap-[12px] min-[1440px]:flex-col min-[1440px]:items-start">
          <h1 className="font-medium text-[20px] md:text-[24px] lg:text-[24px] xl:text-[30px] 2xl:text-[36px] leading-[1.3] text-[#131314] flex-1 min-[1440px]:flex-none">
            {heading || product.title}
          </h1>
          <ProductActionIcons
            productId={product.id}
            productTitle={product.title}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-[10px]">
          <Rating rating={product.rating} reviewsCount={product.reviewsCount} />
          <StockBadge inStock={product.inStock} />
        </div>

        {product.description && (
          <div className="flex flex-col gap-[6px]">
            <p
              className="block max-w-full font-normal text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px] leading-[1.5] text-[rgba(19,19,20,0.7)]"
              style={
                isDescriptionExpanded
                  ? undefined
                  : {
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
              }
            >
              {product.description}
            </p>
            {product.description.trim().length > 120 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                className="w-fit text-[13px] md:text-[14px] lg:text-[15px] text-[#ef6f2e] hover:opacity-80 transition-opacity"
              >
                {isDescriptionExpanded ? "Свернуть" : "Читать далее"}
              </button>
            )}
          </div>
        )}

        <Divider />

        <ColorSelector
          colors={product.colors}
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          selectedColorName={selectedColorName}
        />

        <StorageSelector
          label="Встроенная память"
          storageOptions={product.storageOptions}
          selectedStorage={selectedStorage}
          onStorageSelect={handleStorageSelect}
        />

        <ModificationSelector
          options={product.modificationOptions || []}
          onSelect={onModificationSelect}
        />

        {!showModificationOptions && (
          <>
            <StorageSelector
              label="SIM"
              storageOptions={product.simOptions || []}
              selectedStorage={selectedSim}
              onStorageSelect={handleSimSelect}
            />

            <StorageSelector
              label="eSIM"
              storageOptions={product.esimOptions || []}
              selectedStorage={selectedEsim}
              onStorageSelect={handleEsimSelect}
            />
          </>
        )}

        {showStaticSimEsim && (
          <div className="flex flex-col gap-[12px] md:gap-[18px] lg:gap-[24px]">
            <span className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
              SIM / eSIM
            </span>
            <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px]">
              <span className="px-[8px] py-[8px] md:px-[9px] md:py-[9px] lg:px-[10px] lg:py-[10px] rounded-[6px] md:rounded-[7px] lg:rounded-[8px] border border-[#131314] font-medium text-[#131314] text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1]">
                {product.simEsimDisplay}
              </span>
            </div>
          </div>
        )}

        <ProductPrice price={displayedPrice} oldPrice={displayedOldPrice} />

        <DeliveryInfo
          pickup={product.deliveryInfo.pickup}
          courier={product.deliveryInfo.courier}
        />

        <ProductActions
          productId={product.id}
          productName={product.title}
          productPrice={displayedPrice}
          cartItemOptions={selectedVariant}
        />
      </div>
    );
  },
);

ProductInfo.displayName = "ProductInfo";
