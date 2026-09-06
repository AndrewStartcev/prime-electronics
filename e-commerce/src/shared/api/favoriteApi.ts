import { apiClient } from "./apiClient";

export interface FavoriteProduct {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: string;
    oldPrice: string | null;
    image: string | null;
    isActive: boolean;
    isOnSale: boolean;
    inStock: boolean;
    category: {
      id: string;
      title: string;
      slug: string;
    };
    brand: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  createdAt: string;
}

export const favoriteApi = {
  // Get all favorites
  getFavorites: async (): Promise<FavoriteProduct[]> => {
    const response = await apiClient.get("/favorites");
    return response.data;
  },

  // Get favorites count
  getFavoritesCount: async (): Promise<number> => {
    const response = await apiClient.get("/favorites/count");
    return response.data.count;
  },

  // Add to favorites
  addToFavorites: async (productId: string) => {
    const response = await apiClient.post(`/favorites/${productId}`);
    return response.data;
  },

  // Remove from favorites
  removeFromFavorites: async (productId: string) => {
    const response = await apiClient.delete(`/favorites/${productId}`);
    return response.data;
  },

  // Check if product is favorite
  isFavorite: async (productId: string): Promise<boolean> => {
    const response = await apiClient.get(`/favorites/check/${productId}`);
    return response.data.isFavorite;
  },

  // Clear all favorites
  clearFavorites: async () => {
    const response = await apiClient.delete("/favorites");
    return response.data;
  },
};
