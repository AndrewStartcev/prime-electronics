import { create } from "zustand";

const GUEST_FAVORITES_KEY = "guest_favorites";

interface GuestFavoritesState {
  favorites: Set<string>;
  initialized: boolean;

  // Actions
  initialize: () => void;
  isFavorite: (productId: string) => boolean;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
  getFavoritesList: () => string[];
}

function loadFavoritesFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(parsed);
    }
  } catch (error) {
    console.error("Failed to load guest favorites:", error);
  }

  return new Set();
}

function saveFavoritesToStorage(favorites: Set<string>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      GUEST_FAVORITES_KEY,
      JSON.stringify(Array.from(favorites))
    );
  } catch (error) {
    console.error("Failed to save guest favorites:", error);
  }
}

export const useGuestFavoritesStore = create<GuestFavoritesState>(
  (set, get) => ({
    favorites: new Set(),
    initialized: false,

    initialize: () => {
      if (get().initialized) return;

      const favorites = loadFavoritesFromStorage();
      set({ favorites, initialized: true });
    },

    isFavorite: (productId: string) => {
      return get().favorites.has(productId);
    },

    addToFavorites: (productId: string) => {
      const { favorites } = get();
      const newFavorites = new Set(favorites);
      newFavorites.add(productId);
      saveFavoritesToStorage(newFavorites);
      set({ favorites: newFavorites });
    },

    removeFromFavorites: (productId: string) => {
      const { favorites } = get();
      const newFavorites = new Set(favorites);
      newFavorites.delete(productId);
      saveFavoritesToStorage(newFavorites);
      set({ favorites: newFavorites });
    },

    toggleFavorite: (productId: string) => {
      const { favorites } = get();
      const newFavorites = new Set(favorites);

      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }

      saveFavoritesToStorage(newFavorites);
      set({ favorites: newFavorites });
    },

    clearFavorites: () => {
      const newFavorites = new Set<string>();
      saveFavoritesToStorage(newFavorites);
      set({ favorites: newFavorites });
    },

    getFavoritesCount: () => {
      return get().favorites.size;
    },

    getFavoritesList: () => {
      return Array.from(get().favorites);
    },
  })
);
