import { create } from "zustand";

interface ModalState {
  isModalOpen: boolean;
  isFiltersOpen: boolean;
  isSortOpen: boolean;
  isPriceRangeOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  openFilters: () => void;
  closeFilters: () => void;
  openSort: () => void;
  closeSort: () => void;
  openPriceRange: () => void;
  closePriceRange: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isModalOpen: false,
  isFiltersOpen: false,
  isSortOpen: false,
  isPriceRangeOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  openFilters: () => set({ isFiltersOpen: true, isModalOpen: true }),
  closeFilters: () => set({ isFiltersOpen: false, isModalOpen: false }),
  openSort: () => set({ isSortOpen: true, isModalOpen: true }),
  closeSort: () => set({ isSortOpen: false, isModalOpen: false }),
  openPriceRange: () => set({ isPriceRangeOpen: true, isModalOpen: true }),
  closePriceRange: () => set({ isPriceRangeOpen: false, isModalOpen: false }),
}));
