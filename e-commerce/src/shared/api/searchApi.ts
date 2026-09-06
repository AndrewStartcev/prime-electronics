import { apiClient } from "./apiClient";
import { ProductResponse } from "./productApi";

export interface AutocompleteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  type: "product";
}

export interface AutocompleteCategory {
  id: string;
  name: string;
  slug: string;
  type: "category";
}

export interface AutocompleteBrand {
  id: string;
  name: string;
  slug: string;
  type: "brand";
}

export interface AutocompleteResponse {
  suggestions: {
    products: AutocompleteProduct[];
    categories: AutocompleteCategory[];
    brands: AutocompleteBrand[];
  };
}

export interface SearchResult {
  results: ProductResponse[];
  total: number;
}

export interface PopularSearchResponse {
  popular: string[];
}

export const searchApi = {
  // Autocomplete для поисковой строки
  autocomplete: async (query: string, limit: number = 5) => {
    const normalizedQuery = query.trim();

    const { data } = await apiClient.get<AutocompleteResponse>(
      "/search/autocomplete",
      {
        params: { q: normalizedQuery, limit },
      }
    );
    // Transform backend response to match ProductResponse format
    return {
      products:
        data.suggestions.products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price.toString(),
          images: p.image ? [{ url: p.image, alt: p.name }] : [],
          category: { title: "" }, // Will be filled by full product data if needed
        })) || [],
      categories: data.suggestions.categories || [],
      brands: data.suggestions.brands || [],
    };
  },

  // Полный поиск (для страницы результатов)
  search: async (query: string, limit: number = 20) => {
    const normalizedQuery = query.trim();

    const { data } = await apiClient.get<SearchResult>("/search", {
      params: { q: normalizedQuery, limit },
    });
    return data;
  },

  // Популярные запросы
  getPopular: async () => {
    const { data } = await apiClient.get<PopularSearchResponse>(
      "/search/popular"
    );
    return data.popular.map((term) => ({ term, count: 0 }));
  },
};
