import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { customers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { sendOrderConfirmation } from "@/lib/email/orders";

type OrderRequest = { name?: string; email?: string; phone?: string; delivery?: "essen" | "post"; address?: string; items?: { variantId: string; quantity: number }[] };

export async function POST(request: Request) {
  const body = await request.json() as OrderRequest;
  const items = body.items?.filter((item) => typeof item.variantId === "string" && Number.isInteger(item.quantity) && item.quantity > 0) ?? [];
  if (!body.name?.trim() || !body.email?.includes("@") || !body.phone?.trim() || !body.delivery || !items.length) return NextResponse.json({ error: "Bitte fülle alle Pflichtfelder aus." }, { status: 400 });
  if (body.delivery === "post" && !body.address?.trim()) return NextResponse.json({ error: "Bitte gib deine Lieferadresse an." }, { status: 400 });

  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user.email ?? body.email.trim();
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  const requestedItems = [...quantities].map(([variantId, quantity]) => ({ variantId, quantity }));
  const orderNumber = `WL-${Date.now().toString().slice(-8)}`;
  const deliveryAddress = body.delivery === "essen" ? "Abholung oder Lieferung in Essen nach Vereinbarung" : body.address!.trim();
  let customerId: string | null = null;
  if (session) {
    const [customer] = await db.insert(customers).values({ email, firstName: body.name.trim(), phone: body.phone.trim() }).onConflictDoUpdate({ target: customers.email, set: { firstName: body.name.trim(), phone: body.phone.trim() } }).returning({ id: customers.id });
    customerId = customer?.id ?? null;
  }
  const values = sql.join(requestedItems.map((item) => sql`(${item.variantId}::uuid, ${item.quantity}::integer)`), sql`, `);
  const orderId = crypto.randomUUID();
  const result = await db.execute(sql`
    WITH requested(variant_id, quantity) AS (VALUES ${values}),
    valid_stock AS (
      SELECT NOT EXISTS (
        SELECT 1 FROM requested required
        LEFT JOIN product_variants variant ON variant.id = required.variant_id
        LEFT JOIN products product ON product.id = variant.product_id
        WHERE variant.id IS NULL OR product.status <> 'active' OR variant.stock_quantity < required.quantity
      ) AS is_available
    ),
    decremented AS (
      UPDATE product_variants variant SET stock_quantity = variant.stock_quantity - requested.quantity
      FROM requested, valid_stock WHERE variant.id = requested.variant_id AND valid_stock.is_available
      RETURNING variant.id
    ),
    created_order AS (
      INSERT INTO orders (id, order_number, customer_id, email, total_in_cents, delivery_address)
      SELECT ${orderId}::uuid, ${orderNumber}, ${customerId}::uuid, ${email}, SUM(variant.price_in_cents * requested.quantity), ${deliveryAddress}
      FROM requested JOIN product_variants variant ON variant.id = requested.variant_id
      WHERE (SELECT COUNT(*) FROM decremented) = (SELECT COUNT(*) FROM requested)
      GROUP BY ${orderId}
      RETURNING id, total_in_cents
    )
    , created_items AS (
      INSERT INTO order_items (order_id, variant_id, product_title, variant_title, unit_price_in_cents, quantity)
      SELECT created_order.id, variant.id, product.title, variant.title, variant.price_in_cents, requested.quantity
      FROM created_order JOIN requested ON true
      JOIN product_variants variant ON variant.id = requested.variant_id
      JOIN products product ON product.id = variant.product_id
      RETURNING order_id
    )
    SELECT id, total_in_cents FROM created_order;
  `);
  if (!result.rows.length) return NextResponse.json({ error: "Ein Artikel ist nicht mehr in der gewünschten Menge verfügbar." }, { status: 409 });

  void sendOrderConfirmation({ email, orderNumber, totalInCents: Number(result.rows[0]?.total_in_cents ?? 0) }).catch(console.error);
  return NextResponse.json({ orderNumber });
}