import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { OrderStatusForm } from "@/components/admin/order-status-form";
import { orderItems, orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

type AdminOrderPageProps = { params: Promise<{ id: string }> };
const formatPrice = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value / 100);

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") redirect("/account");
  const { id } = await params;
  const [[order], items] = await Promise.all([db.select().from(orders).where(eq(orders.id, id)), db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.productTitle))]);
  if (!order) notFound();

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">Bestellung</p><h1>{order.orderNumber}</h1></div><Link className="back-link" href="/admin/orders">Zurück zu Bestellungen</Link></header><section className="order-detail"><div className="order-detail-block"><p className="eyebrow">Kunde</p><h2>{order.email}</h2><p>{order.deliveryAddress}</p><p className="order-meta">Zahlung bei Empfang</p></div><div className="order-detail-block"><p className="eyebrow">Status</p><OrderStatusForm orderId={order.id} currentStatus={order.status} /></div><div className="order-detail-block order-items-list"><p className="eyebrow">Artikel</p>{items.map((item) => <article key={item.id}><div><strong>{item.productTitle}</strong><span>{item.variantTitle} · {item.quantity} Stück</span></div><span>{formatPrice(item.unitPriceInCents * item.quantity)}</span></article>)}<div className="order-total"><strong>Gesamt</strong><strong>{formatPrice(order.totalInCents)}</strong></div></div></section></main>;
}