import "server-only";
import { categories as sampleCategories } from "@/content/categories";
import { products as sampleProducts } from "@/content/products";
import type { Category, Product } from "@/content/types";

/**
 * Catalog repository. Pages never import content files directly; they go through
 * this interface so the source can move from the sample files to the database
 * (Supabase `products`/`categories` tables, see supabase/migrations) without
 * touching any page or component.
 */
export interface CatalogRepository {
  listProducts(filter?: { category?: string; tag?: string; includeArchived?: boolean }): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | undefined>;
  related(product: Product, limit?: number): Promise<Product[]>;
}

const statusOrder: Record<Product["status"], number> = { available: 0, preview: 1, "coming-soon": 2, archived: 3 };

class SampleCatalogRepository implements CatalogRepository {
  async listProducts(filter: { category?: string; tag?: string; includeArchived?: boolean } = {}) {
    return sampleProducts
      .filter((p) => filter.includeArchived || p.status !== "archived")
      .filter((p) => !filter.category || p.categories.includes(filter.category))
      .filter((p) => !filter.tag || p.tags.includes(filter.tag))
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || Number(b.featured) - Number(a.featured));
  }
  async getProduct(slug: string) {
    return sampleProducts.find((p) => p.slug === slug && p.status !== "archived");
  }
  async listCategories() {
    return [...sampleCategories].sort((a, b) => a.order - b.order);
  }
  async getCategory(slug: string) {
    return sampleCategories.find((c) => c.slug === slug);
  }
  async related(product: Product, limit = 3) {
    const all = await this.listProducts();
    const score = (p: Product) =>
      p.categories.filter((c) => product.categories.includes(c)).length * 2 +
      p.tags.filter((t) => product.tags.includes(t)).length +
      (p.status === "preview" ? 1 : 0);
    return all
      .filter((p) => p.id !== product.id)
      .sort((a, b) => score(b) - score(a))
      .slice(0, limit);
  }
}

// When Supabase is connected, swap this for `new SupabaseCatalogRepository()`.
export const catalog: CatalogRepository = new SampleCatalogRepository();
