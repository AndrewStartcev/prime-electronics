import { useState, useRef, useEffect, useCallback } from "react";

interface SearchProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
}

interface UseSearchOptions {
  products: SearchProduct[];
  maxResults?: number;
}

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  filteredProducts: SearchProduct[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleSelectSuggestion: (query: string) => void;
  clearSearch: () => void;
}

export const useSearch = ({
  products,
  maxResults = 5,
}: UseSearchOptions): UseSearchReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<SearchProduct[]>(
    products.slice(0, maxResults)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter products on query change
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, maxResults));
    } else {
      setFilteredProducts(products.slice(0, maxResults));
    }
  }, [searchQuery, products, maxResults]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleSelectSuggestion = useCallback((query: string) => {
    setSearchQuery(query);
    setIsOpen(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredProducts(products.slice(0, maxResults));
  }, [products, maxResults]);

  return {
    searchQuery,
    setSearchQuery,
    isOpen,
    open,
    close,
    filteredProducts,
    containerRef,
    handleSelectSuggestion,
    clearSearch,
  };
};
