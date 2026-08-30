import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { cartItems, carts, customers, productVariants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

type GuestCartItem = { variantId: string; quantity: number };

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse(null, { status: 204 });

  const body = await request.json() as { items?: GuestCartItem[] };
  const items = (body.items ?? []).filter((item) => typeof item.variantId === "string" && Number.isInteger(item.quantity) && item.quantity > 0);
  if (!items.length) return NextResponse.json({ merged: true });

  let [customer] = await db.select().from(customers).where(eq(customers.email, session.user.email));
  if (!customer) {
    [customer] = await db.insert(customers).values({ email: session.user.email, firstName: session.user.name }).returning();
  }

  let [cart] = await db.select().from(carts).where(eq(carts.customerId, customer.id));
  if (!cart) [cart] = await db.insert(carts).values({ customerId: customer.id }).returning();

  const variantIds = [...new Set(items.map((item) => item.variantId))];
  const variants = await db.select().from(productVariants).where(inArray(productVariants.id, variantIds));
  const validItems = items.filter((item) => variants.some((variant) => variant.id === item.variantId && variant.stockQuantity > 0));

  for (const item of validItems) {
    const variant = variants.find((candidate) => candidate.id === item.variantId);
    if (!variant) continue;
    const [existing] = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, item.variantId)));
    if (existing) await db.update(cartItems).set({ quantity: existing.quantity + item.quantity }).where(eq(cartItems.id, existing.id));
    else await db.insert(cartItems).values({ cartId: cart.id, variantId: item.variantId, quantity: item.quantity, priceSnapshotInCents: variant.priceInCents });
  }

  return NextResponse.json({ merged: true });
}