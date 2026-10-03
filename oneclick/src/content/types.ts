import type { Localized, Locale } from "@/i18n/config";
import type { Money } from "@/lib/money";

export type ArtId = Hue | "ramadan" | "meal" | "baby" | "home" | "kids" | "party" | "gift" | "habit" | "business" | "bundle";

export type Hue = "bride" | "grocery" | "planner" | "fit" | "budget" | "study" | "travel" | "brand";

export type Category = {
  slug: string;
  parent?: string; // supports subcategories
  name: Localized;
  description: Localized;
  hue: Hue;
  order: number;
};

/** What the customer actually receives. Shown on every product page. */
export type ProductKind = "interactive" | "download" | "bundle" | "custom-service";
export type AccessModel = "lifetime" | "subscription" | "limited" | "download" | "free";

/**
 * Lifecycle:
 * - "preview": public page + safe demo, purchasing not open yet (payment not connected)
 * - "available": purchasable (only once a payment provider is LIVE)
 * - "coming-soon": announced, no demo yet
 * - "archived": hidden from catalog, still accessible to owners
 */
export type ProductStatus = "preview" | "available" | "coming-soon" | "archived";

export type DemoId = "grocery" | "bride" | "planner" | "fit" | "reset";

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  summary: Localized;
  problem: Localized;
  audience: Localized;
  story: { chaos: Localized; result: Localized };
  benefits: Localized[];
  features: { title: Localized; body: Localized }[];
  included: Localized[];
  devices: Localized;
  languages: Locale[];
  kind: ProductKind;
  access: AccessModel;
  status: ProductStatus;
  /** null = free. Prices are editable data, never hard-coded in components. */
  price: Money | null;
  categories: string[];
  tags: string[];
  hue: Hue;
  /** Illustration scene; defaults to the hue scene. */
  art?: ArtId;
  featured: boolean;
  isNew: boolean;
  /** Bundles only: product ids a bundle license unlocks. */
  includes?: string[];
  demo?: DemoId;
  faqs: { q: Localized; a: Localized }[];
  disclaimer?: Localized;
  /** Content is demo/sample until the owner approves it. */
  sample: boolean;
  updatedAt: string;
};

export type Guide = {
  slug: string;
  title: Localized;
  excerpt: Localized;
  category: string;
  readingMinutes: number;
  relatedProduct?: string;
  publishedAt: string;
  body: { en: string[]; ar: string[] }; // paragraphs; "## " prefix = heading, "- " = list item
};

export type Faq = { id: string; group: "general" | "access" | "payment" | "custom" | "account"; q: Localized; a: Localized };
