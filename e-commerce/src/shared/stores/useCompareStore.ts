"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareState {
  compareItems: string[];
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareItems: [],

      addToCompare: (productId: string) => {
        const { compareItems } = get();
        if (compareItems.length >= MAX_COMPARE_ITEMS) {
          // Remove oldest item and add new one
          set({ compareItems: [...compareItems.slice(1), productId] });
        } else if (!compareItems.includes(productId)) {
          set({ compareItems: [...compareItems, productId] });
        }
      },

      removeFromCompare: (productId: string) => {
        const { compareItems } = get();
        set({ compareItems: compareItems.filter((id) => id !== productId) });
      },

      toggleCompare: (productId: string) => {
        const { compareItems, addToCompare, removeFromCompare } = get();
        if (compareItems.includes(productId)) {
          removeFromCompare(productId);
        } else {
          addToCompare(productId);
        }
      },

      isInCompare: (productId: string) => {
        return get().compareItems.includes(productId);
      },

      clearCompare: () => {
        set({ compareItems: [] });
      },
    }),
    {
      name: "compare-storage",
    },
  ),
);
