import { create } from "zustand";

export interface CatalogFiltersState {
  // Filter values
  inStock: boolean;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  brandIds: string[];
  attributes: Record<string, string[]>;
  sortBy: "popular" | "price-asc" | "price-desc" | "new" | "rating";

  // Actions
  setInStock: (value: boolean) => void;
  setPriceRange: (min: number | undefined, max: number | undefined) => void;
  toggleBrand: (brandId: string) => void;
  setBrands: (brandIds: string[]) => void;
  toggleAttribute: (name: string, value: string) => void;
  setAttributes: (attributes: Record<string, string[]>) => void;
  setSortBy: (
    sortBy: "popular" | "price-asc" | "price-desc" | "new" | "rating"
  ) => void;
  resetFilters: () => void;

  // Computed
  hasActiveFilters: () => boolean;
}

const initialState = {
  inStock: false,
  minPrice: undefined,
  maxPrice: undefined,
  brandIds: [] as string[],
  attributes: {} as Record<string, string[]>,
  sortBy: "popular" as const,
};

export const useCatalogFiltersStore = create<CatalogFiltersState>(
  (set, get) => ({
    ...initialState,

    setInStock: (value) => set({ inStock: value }),

    setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),

    toggleBrand: (brandId) =>
      set((state) => ({
        brandIds: state.brandIds.includes(brandId)
          ? state.brandIds.filter((id) => id !== brandId)
          : [...state.brandIds, brandId],
      })),

    setBrands: (brandIds) => set({ brandIds }),

    toggleAttribute: (name, value) =>
      set((state) => {
        const current = state.attributes[name] || [];
        const newValues = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];

        const newAttributes = { ...state.attributes };
        if (newValues.length === 0) {
          delete newAttributes[name];
        } else {
          newAttributes[name] = newValues;
        }

        return { attributes: newAttributes };
      }),

    setAttributes: (attributes) => set({ attributes }),

    setSortBy: (sortBy) => set({ sortBy }),

    resetFilters: () => set(initialState),

    hasActiveFilters: () => {
      const state = get();
      return (
        state.inStock ||
        state.minPrice !== undefined ||
        state.maxPrice !== undefined ||
        state.brandIds.length > 0 ||
        Object.keys(state.attributes).length > 0
      );
    },
  })
);
