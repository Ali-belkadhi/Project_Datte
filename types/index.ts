/**
 * Domain types for the SIWAR storefront.
 * They mirror the shape the future REST / MongoDB API is expected to return,
 * so UI components never depend on the mock data source directly.
 */

export type CategorySlug =
  | "dattes-naturelles"
  | "dattes-fourrees"
  | "sirops"
  | "pates-sucre"
  | "cafe"
  | "biscuits-boules"
  | "coffrets";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Two-line label used in the homepage category rail */
  label: [string, string];
  description: string;
  image: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

/**
 * Describes how a product is rendered in the 3D viewer.
 * - `glb`   : a real 3D model (preferred, to be delivered later)
 * - `box`   : procedural box textured with product photos (gift boxes, coffee…)
 * - `bottle`: procedural glass bottle with a wrapped label
 * - `jar`   : procedural jar with a wrapped label and gold lid
 */
export type Product3DConfig =
  | { kind: "glb"; url: string; scale?: number }
  | {
      kind: "box";
      front: string;
      back?: string;
      /** width, height, depth in scene units */
      size?: [number, number, number];
      color?: string;
    }
  | { kind: "bottle"; label: string; glassColor?: string }
  | { kind: "jar"; label: string; fill?: string };

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** e.g. "6 produits • Édition limitée" or "250 ml" */
  subtitle: string;
  shortDescription: string;
  description: string;
  /** Price in Tunisian dinars (TND) */
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  images: ProductImage[];
  /** Optional URL to a .glb model — takes precedence over `viewer` */
  modelUrl?: string;
  viewer?: Product3DConfig;
  rating: ProductRating;
  badges: string[];
  features: string[];
  contents?: string[];
  weight: string;
  stock: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity: number;
}

export type SortOption = "pertinence" | "prix-asc" | "prix-desc" | "nouveautes" | "note";

export interface ProductFilters {
  query?: string;
  categories?: CategorySlug[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  price: number;
  eta: string;
}
