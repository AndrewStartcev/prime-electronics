import type {
  ProductLinkedVariant,
  ProductVariantConfiguration,
} from "../model";
import { normalizeVariantOption } from "./variantConfigurations";

type VariantSelection = {
  color?: string;
  memory?: string;
  sim?: string;
  esim?: string;
};

type ResolveLinkedVariantSelectionParams = {
  linkedVariants: ProductLinkedVariant[];
  configurations: ProductVariantConfiguration[];
  currentSelection: VariantSelection;
  nextSelection: VariantSelection;
};

function getRequestedSelection(
  currentSelection: VariantSelection,
  nextSelection: VariantSelection,
): Required<VariantSelection> {
  return {
    color: nextSelection.color ?? currentSelection.color ?? "",
    memory: nextSelection.memory ?? currentSelection.memory ?? "",
    sim: nextSelection.sim ?? currentSelection.sim ?? "",
    esim: nextSelection.esim ?? currentSelection.esim ?? "",
  };
}

function configurationMatchesSelection(
  config: ProductVariantConfiguration,
  requested: Required<VariantSelection>,
): boolean {
  const checks: Array<[string | undefined, string]> = [
    [config.color, requested.color],
    [config.memory, requested.memory],
    [config.sim, requested.sim],
    [config.esim, requested.esim],
  ];

  return checks.every(([configValue, requestedValue]) => {
    const normalizedConfig = normalizeVariantOption(configValue);
    const normalizedRequested = normalizeVariantOption(requestedValue);
    return !normalizedConfig || !normalizedRequested || normalizedConfig === normalizedRequested;
  });
}

function getConfigurationScore(config: ProductVariantConfiguration): number {
  return [config.color, config.memory, config.sim, config.esim].filter((value) =>
    Boolean(normalizeVariantOption(value)),
  ).length;
}

function findMatchingConfiguration(
  configurations: ProductVariantConfiguration[],
  requested: Required<VariantSelection>,
): ProductVariantConfiguration | null {
  let bestConfig: ProductVariantConfiguration | null = null;
  let bestScore = -1;

  for (const config of configurations) {
    if (!config.linkedProductId || !configurationMatchesSelection(config, requested)) {
      continue;
    }

    const score = getConfigurationScore(config);
    if (score > bestScore) {
      bestConfig = config;
      bestScore = score;
    }
  }

  return bestConfig;
}

function variantMatchesExactSelection(
  variant: ProductLinkedVariant,
  requested: Required<VariantSelection>,
): boolean {
  return (
    normalizeVariantOption(variant.color) === normalizeVariantOption(requested.color) &&
    normalizeVariantOption(variant.memory) === normalizeVariantOption(requested.memory) &&
    normalizeVariantOption(variant.sim) === normalizeVariantOption(requested.sim)
  );
}

function variantMatchesChangedSelection(
  variant: ProductLinkedVariant,
  requested: Required<VariantSelection>,
  nextSelection: VariantSelection,
): boolean {
  if (
    nextSelection.color !== undefined &&
    normalizeVariantOption(variant.color) !== normalizeVariantOption(requested.color)
  ) {
    return false;
  }
  if (
    nextSelection.memory !== undefined &&
    normalizeVariantOption(variant.memory) !== normalizeVariantOption(requested.memory)
  ) {
    return false;
  }
  if (
    nextSelection.sim !== undefined &&
    normalizeVariantOption(variant.sim) !== normalizeVariantOption(requested.sim)
  ) {
    return false;
  }
  return true;
}

function variantMatchesPrimaryFallback(
  variant: ProductLinkedVariant,
  requested: Required<VariantSelection>,
  nextSelection: VariantSelection,
): boolean {
  if (nextSelection.color !== undefined) {
    return normalizeVariantOption(variant.color) === normalizeVariantOption(requested.color);
  }
  if (nextSelection.memory !== undefined) {
    return normalizeVariantOption(variant.memory) === normalizeVariantOption(requested.memory);
  }
  if (nextSelection.sim !== undefined) {
    return normalizeVariantOption(variant.sim) === normalizeVariantOption(requested.sim);
  }
  return true;
}

export function resolveLinkedVariantSelection({
  linkedVariants,
  configurations,
  currentSelection,
  nextSelection,
}: ResolveLinkedVariantSelectionParams): ProductLinkedVariant | null {
  const requested = getRequestedSelection(currentSelection, nextSelection);
  const activeVariants = linkedVariants.filter((variant) => variant.isActive);
  const availableVariants = activeVariants.filter((variant) => variant.inStock);
  const matchingConfiguration = findMatchingConfiguration(configurations, requested);

  if (matchingConfiguration?.linkedProductId) {
    const linkedAvailableVariant = availableVariants.find(
      (variant) => variant.id === matchingConfiguration.linkedProductId,
    );
    if (linkedAvailableVariant) return linkedAvailableVariant;
  }

  const exactAvailableVariant = availableVariants.find((variant) =>
    variantMatchesExactSelection(variant, requested),
  );
  if (exactAvailableVariant) return exactAvailableVariant;

  const changedAvailableVariant = availableVariants.find((variant) =>
    variantMatchesChangedSelection(variant, requested, nextSelection),
  );
  if (changedAvailableVariant) return changedAvailableVariant;

  const fallbackAvailableVariant = availableVariants.find((variant) =>
    variantMatchesPrimaryFallback(variant, requested, nextSelection),
  );
  if (fallbackAvailableVariant) return fallbackAvailableVariant;

  if (matchingConfiguration?.linkedProductId) {
    const linkedActiveVariant = activeVariants.find(
      (variant) => variant.id === matchingConfiguration.linkedProductId,
    );
    if (linkedActiveVariant) return linkedActiveVariant;
  }

  const exactActiveVariant = activeVariants.find((variant) =>
    variantMatchesExactSelection(variant, requested),
  );
  if (exactActiveVariant) return exactActiveVariant;

  return (
    activeVariants.find((variant) =>
      variantMatchesChangedSelection(variant, requested, nextSelection),
    ) || null
  );
}
