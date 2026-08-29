import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { categories, productCategories, productImages, products, productVariants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

type ProductRequest = { title?: string; slug?: string; description?: string; categoryId?: string; priceInCents?: number; status?: "draft" | "active" | "archived"; isFeatured?: boolean; variant?: { sku?: string; title?: string; stockQuantity?: number }; image?: { url?: string; altText?: string } };

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Nicht berechtigt." }, { status: 403 });

  const body = await request.json() as ProductRequest;
  const variant = body.variant;
  const isValidSlug = typeof body.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug);
  if (typeof body.title !== "string" || !body.title.trim() || !isValidSlug || typeof body.categoryId !== "string" || typeof body.priceInCents !== "number" || !Number.isInteger(body.priceInCents) || body.priceInCents < 0 || !variant || typeof variant.sku !== "string" || !variant.sku.trim() || typeof variant.title !== "string" || !variant.title.trim() || typeof variant.stockQuantity !== "number" || !Number.isInteger(variant.stockQuantity) || variant.stockQuantity < 0 || !body.status) return NextResponse.json({ error: "Bitte überprüfe die Pflichtfelder." }, { status: 400 });
  if (body.image && (!body.image.url?.startsWith("http") || !body.image.altText?.trim())) return NextResponse.json({ error: "Bitte gib eine gültige Bild-URL und einen Alternativtext ein." }, { status: 400 });

  const title = body.title.trim();
  const slug = body.slug as string;
  const priceInCents = body.priceInCents;
  const status = body.status as "draft" | "active" | "archived";
  const productVariant = { sku: variant.sku.trim(), title: variant.title.trim(), stockQuantity: variant.stockQuantity };
  const image = body.image ? { url: body.image.url!, altText: body.image.altText!.trim() } : undefined;

  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, body.categoryId));
  if (!category) return NextResponse.json({ error: "Die Kategorie wurde nicht gefunden." }, { status: 400 });

  try {
    const [product] = await db.insert(products).values({ slug, title, description: body.description?.trim() || null, status, isFeatured: body.isFeatured === true, priceInCents }).returning();
    if (!product) throw new Error("Product insert failed");
    await db.insert(productCategories).values({ productId: product.id, categoryId: category.id });
    await db.insert(productVariants).values({ productId: product.id, sku: productVariant.sku, title: productVariant.title, priceInCents, stockQuantity: productVariant.stockQuantity });
    if (image) await db.insert(productImages).values({ productId: product.id, url: image.url, altText: image.altText, position: 0 });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) return NextResponse.json({ error: "Slug oder SKU ist bereits vergeben." }, { status: 409 });
    return NextResponse.json({ error: "Das Produkt konnte nicht gespeichert werden." }, { status: 500 });
  }
}