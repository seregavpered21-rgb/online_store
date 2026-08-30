import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { categories, productCategories, productImages, products, productVariants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

type VariantInput = { id?: string; sku?: string; title?: string; stockQuantity?: number };
type ImageInput = { id?: string; url?: string; altText?: string };
type ProductRequest = { title?: string; slug?: string; description?: string; categoryId?: string; priceInCents?: number; status?: "draft" | "active" | "archived"; isFeatured?: boolean; variants?: VariantInput[]; images?: ImageInput[] };
type RouteContext = { params: Promise<{ id: string }> };

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.role === "admin";
}

function revalidateProduct(slug: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin");
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as ProductRequest;
  const isValidSlug = typeof body.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug);
  const isValidVariant = (variant: VariantInput) => typeof variant.sku === "string" && variant.sku.trim() && typeof variant.title === "string" && variant.title.trim() && typeof variant.stockQuantity === "number" && Number.isInteger(variant.stockQuantity) && variant.stockQuantity >= 0;
  const isValidImage = (image: ImageInput) => typeof image.url === "string" && image.url.startsWith("http") && typeof image.altText === "string" && image.altText.trim();
  if (typeof body.title !== "string" || !body.title.trim() || !isValidSlug || typeof body.categoryId !== "string" || typeof body.priceInCents !== "number" || !Number.isInteger(body.priceInCents) || body.priceInCents < 0 || !body.status || !body.variants?.length || !body.variants.every(isValidVariant) || !body.images?.every(isValidImage)) return NextResponse.json({ error: "Bitte überprüfe die Produktdaten." }, { status: 400 });
  const slug = body.slug as string;

  const [product] = await db.select().from(products).where(eq(products.id, id));
  if (!product) return NextResponse.json({ error: "Produkt nicht gefunden." }, { status: 404 });
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, body.categoryId));
  if (!category) return NextResponse.json({ error: "Kategorie nicht gefunden." }, { status: 400 });
  const [sameSlug] = await db.select({ id: products.id }).from(products).where(and(eq(products.slug, slug), ne(products.id, id)));
  if (sameSlug) return NextResponse.json({ error: "Dieser Slug ist bereits vergeben." }, { status: 409 });

  const title = body.title.trim();
  const priceInCents = body.priceInCents;
  const status = body.status as "draft" | "active" | "archived";
  try {
    await db.update(products).set({ title, slug, description: body.description?.trim() || null, status, isFeatured: body.isFeatured === true, priceInCents }).where(eq(products.id, id));
    await db.delete(productCategories).where(eq(productCategories.productId, id));
    await db.insert(productCategories).values({ productId: id, categoryId: category.id });
    for (const variant of body.variants) {
      const values = { sku: variant.sku!.trim(), title: variant.title!.trim(), stockQuantity: variant.stockQuantity!, priceInCents };
      if (variant.id) await db.update(productVariants).set(values).where(and(eq(productVariants.id, variant.id), eq(productVariants.productId, id)));
      else await db.insert(productVariants).values({ ...values, productId: id });
    }
    await db.delete(productImages).where(eq(productImages.productId, id));
    if (body.images.length) await db.insert(productImages).values(body.images.map((image, position) => ({ productId: id, url: image.url!, altText: image.altText!.trim(), position })));
    revalidateProduct(product.slug);
    if (slug !== product.slug) revalidateProduct(slug);
    return NextResponse.json({ id });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) return NextResponse.json({ error: "Eine SKU ist bereits vergeben." }, { status: 409 });
    return NextResponse.json({ error: "Das Produkt konnte nicht gespeichert werden." }, { status: 500 });
  }
}