export interface Filter {
  id: string;
  name: string;
  type: "checkbox" | "range" | "radio";
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface CatalogCategory {
  slug: string;
  name: string;
  count: number;
  filters: Filter[];
  subcategories?: { id: string; label: string }[];
}
