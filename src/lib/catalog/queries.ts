import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

import { categories, productCategories, products, productVariants } from "@/db/schema";
import { db } from "@/lib/db/client";

const productTones: Record<string, string> = {
  "wollmantel-terracotta": "clay",
  "ledertasche-bernstein": "ochre",
  "seidentuch-rosenholz": "rose",
};

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(priceInCents / 100);
}

function toCatalogProduct(product: typeof products.$inferSelect) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.title,
    description: product.description ?? "",
    priceInCents: product.priceInCents,
    price: formatPrice(product.priceInCents),
    tone: productTones[product.slug] ?? "sand",
    label: product.isFeatured ? "Ausgewählt" : "Neu",
  };
}

export async function getNavigationCategories() {
  return db.select().from(categories).orderBy(asc(categories.title));
}

type ProductFilters = { query?: string; category?: string; sort?: "featured" | "price-asc" | "price-desc" };

export async function getProducts(filters: ProductFilters = {}) {
  const conditions = [eq(products.status, "active")];
  if (filters.query) conditions.push(or(ilike(products.title, `%${filters.query}%`), ilike(products.description, `%${filters.query}%`))!);

  const sort = filters.sort === "price-asc" ? asc(products.priceInCents) : filters.sort === "price-desc" ? desc(products.priceInCents) : desc(products.isFeatured);
  const baseQuery = db.select({ product: products }).from(products);
  const rows = filters.category
    ? await baseQuery.innerJoin(productCategories, eq(products.id, productCategories.productId)).innerJoin(categories, eq(productCategories.categoryId, categories.id)).where(and(...conditions, eq(categories.slug, filters.category))).orderBy(sort, asc(products.title))
    : await baseQuery.where(and(...conditions)).orderBy(sort, asc(products.title));
  return rows.map(({ product }) => toCatalogProduct(product));
}

export async function getProductBySlug(slug: string) {
  const [product] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.status, "active")));
  if (!product) return undefined;

  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(asc(productVariants.title));
  return {
    ...toCatalogProduct(product),
    variants: variants.map((variant) => ({ id: variant.id, title: variant.title, color: variant.attributes.color ?? "", size: variant.attributes.size ?? "", inStock: variant.stockQuantity > 0 })),
    inStock: variants.some((variant) => variant.stockQuantity > 0),
  };
}

export async function getCategoryBySlug(slug: string) {
  const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
  if (!category) return undefined;

  const rows = await db
    .select({ product: products })
    .from(productCategories)
    .innerJoin(products, eq(productCategories.productId, products.id))
    .where(and(eq(productCategories.categoryId, category.id), eq(products.status, "active")))
    .orderBy(desc(products.isFeatured), asc(products.title));

  return { ...category, products: rows.map(({ product }) => toCatalogProduct(product)) };
}