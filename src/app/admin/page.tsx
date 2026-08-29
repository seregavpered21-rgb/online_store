import { asc, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminProductForm } from "@/components/admin/admin-product-form";
import { categories, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") redirect("/account");

  const [catalog, categoryList] = await Promise.all([
    db.select().from(products).orderBy(desc(products.createdAt)),
    db.select().from(categories).orderBy(asc(categories.title)),
  ]);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div><p className="eyebrow">Warenladen Verwaltung</p><h1>Katalog</h1></div>
        <a className="back-link" href="/">Zum Shop</a>
      </header>
      <section className="admin-layout">
        <AdminProductForm categories={categoryList.map((category) => ({ id: category.id, title: category.title }))} />
        <section className="admin-products" aria-label="Produkte">
          <h2>Produkte</h2>
          {catalog.length ? <div className="admin-table">{catalog.map((product) => <article key={product.id}><div><strong>{product.title}</strong><span>/{product.slug}</span></div><span>{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(product.priceInCents / 100)}</span><span className={`status status-${product.status}`}>{product.status}</span></article>)}</div> : <p>Noch keine Produkte angelegt.</p>}
        </section>
      </section>
    </main>
  );
}