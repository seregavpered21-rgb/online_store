import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { StoreHeader } from "@/components/layout/store-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { customers, orders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await import("next/headers").then(({ headers }) => headers()) });
  if (!session) redirect("/sign-in");
  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, session.user.email));
  const orderList = customer ? await db.select().from(orders).where(eq(orders.customerId, customer.id)).orderBy(desc(orders.createdAt)) : [];
  const formatPrice = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value / 100);
  return <main><StoreHeader /><section className="auth-page"><p className="eyebrow">Mein Konto</p><h1>Hallo, {session.user.name}</h1><p>{session.user.email}</p><section className="account-orders"><p className="eyebrow">Bestellungen</p>{orderList.length ? <div>{orderList.map((order) => <article key={order.id}><div><strong>{order.orderNumber}</strong><span>{new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(order.createdAt)}</span></div><strong>{formatPrice(order.totalInCents)}</strong><span className={`status status-order-${order.status}`}>{order.status}</span></article>)}</div> : <p>Deine Bestellungen erscheinen hier nach dem Kauf.</p>}</section><Link className="back-link" href="/products">Weiter einkaufen</Link><SignOutButton /></section></main>;
}