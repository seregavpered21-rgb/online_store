import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { orderItems, orders, products, productVariants } from "@/db/schema";
import { db } from "@/lib/db/client";

type OrderRequest = { name?: string; email?: string; phone?: string; delivery?: "essen" | "post"; address?: string; items?: { variantId: string; quantity: number }[] };

export async function POST(request: Request) {
  const body = await request.json() as OrderRequest;
  const items = body.items?.filter((item) => typeof item.variantId === "string" && Number.isInteger(item.quantity) && item.quantity > 0) ?? [];
  if (!body.name?.trim() || !body.email?.includes("@") || !body.phone?.trim() || !body.delivery || !items.length) return NextResponse.json({ error: "Bitte fülle alle Pflichtfelder aus." }, { status: 400 });
  if (body.delivery === "post" && !body.address?.trim()) return NextResponse.json({ error: "Bitte gib deine Lieferadresse an." }, { status: 400 });

  const variantIds = [...new Set(items.map((item) => item.variantId))];
  const variants = await db.select({ variant: productVariants, product: products }).from(productVariants).innerJoin(products, eq(productVariants.productId, products.id)).where(inArray(productVariants.id, variantIds));
  if (variants.length !== variantIds.length) return NextResponse.json({ error: "Ein Artikel ist nicht mehr verfügbar." }, { status: 409 });

  const requestedItems = items.map((item) => ({ ...item, variant: variants.find((row) => row.variant.id === item.variantId)! }));
  if (requestedItems.some((item) => item.variant.variant.stockQuantity < item.quantity)) return NextResponse.json({ error: "Ein Artikel ist nicht mehr in der gewünschten Menge verfügbar." }, { status: 409 });

  const totalInCents = requestedItems.reduce((sum, item) => sum + item.variant.variant.priceInCents * item.quantity, 0);
  const orderNumber = `WL-${Date.now().toString().slice(-8)}`;
  const deliveryAddress = body.delivery === "essen" ? "Abholung oder Lieferung in Essen nach Vereinbarung" : body.address!.trim();
  const [order] = await db.insert(orders).values({ orderNumber, email: body.email.trim(), totalInCents, deliveryAddress }).returning();

  await db.insert(orderItems).values(requestedItems.map((item) => ({ orderId: order.id, variantId: item.variant.variant.id, productTitle: item.variant.product.title, variantTitle: item.variant.variant.title, unitPriceInCents: item.variant.variant.priceInCents, quantity: item.quantity })));
  for (const item of requestedItems) await db.update(productVariants).set({ stockQuantity: item.variant.variant.stockQuantity - item.quantity }).where(eq(productVariants.id, item.variant.variant.id));

  return NextResponse.json({ orderNumber });
}