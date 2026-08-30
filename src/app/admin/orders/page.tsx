import Link from "next/link";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

const formatPrice = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value / 100);
const formatDate = (value: Date) => new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(value);

export default async function AdminOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") redirect("/account");
  const orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">Warenladen Verwaltung</p><h1>Bestellungen</h1></div><div className="admin-header-actions"><Link className="back-link" download href="/api/admin/orders/export">CSV exportieren</Link><Link className="back-link" href="/admin">Zum Katalog</Link></div></header><section className="admin-orders">{orderList.length ? <div className="admin-table">{orderList.map((order) => <article key={order.id}><div><strong>{order.orderNumber}</strong><span>{order.email}</span></div><span>{formatDate(order.createdAt)}</span><span>{formatPrice(order.totalInCents)}</span><span className={`status status-order-${order.status}`}>{order.status}</span><Link className="text-action" href={`/admin/orders/${order.id}`}>Ansehen</Link></article>)}</div> : <p className="empty-results">Noch keine Bestellungen eingegangen.</p>}</section></main>;
}