/**
 * Product data-access layer.
 *
 * UI components must import from here — never from `@/data/*` directly.
 * When the backend is ready, replace the bodies with `fetch()` calls
 * (e.g. `fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?...`)`) while
 * keeping the same signatures.
 */
import { allCategories, categories, products } from "@/data/products";
import type { Category, CategorySlug, PaginatedResult, Product, ProductFilters } from "@/types";

export function filterProducts(list: Product[], filters: ProductFilters = {}): Product[] {
  const { query, categories: cats, minPrice, maxPrice, sort = "pertinence" } = filters;
  const q = query?.trim().toLowerCase();

  let result = list.filter((p) => {
    if (q) {
      const haystack = `${p.name} ${p.subtitle} ${p.shortDescription} ${p.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (cats && cats.length > 0 && !cats.includes(p.category)) return false;
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case "prix-asc":
        return a.price - b.price;
      case "prix-desc":
        return b.price - a.price;
      case "nouveautes":
        return b.createdAt.localeCompare(a.createdAt);
      case "note":
        return b.rating.average - a.rating.average || b.rating.count - a.rating.count;
      default:
        return Number(!!b.isBestSeller) - Number(!!a.isBestSeller);
    }
  });

  return result;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const end = page * pageSize;
  return { items: items.slice(0, end), total: items.length, page, pageSize, hasMore: end < items.length };
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  return filterProducts(products, filters);
}

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  const order = ["coffret-prestige", "coffret-decouverte", "sirop-de-dattes", "dattes-deglet-nour"];
  return order
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p))
    .slice(0, limit);
}

export async function getGiftBoxes(): Promise<Product[]> {
  return products.filter((p) => p.category === "coffrets").sort((a, b) => b.price - a.price);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const others = products.filter((p) => p.id !== product.id && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export function getCategoryName(slug: CategorySlug): string {
  return allCategories.find((c) => c.slug === slug)?.name ?? slug;
}

/** Synchronous search used by the client-side search overlay. */
export function searchProducts(query: string, limit = 6): Product[] {
  if (!query.trim()) return [];
  return filterProducts(products, { query }).slice(0, limit);
}
