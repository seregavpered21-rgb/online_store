import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { categories, productCategories, productImages, products, productVariants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";

type ProductEditorPageProps = { params: Promise<{ id: string }> };

export default async function ProductEditorPage({ params }: ProductEditorPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") redirect("/account");
  const { id } = await params;
  const [[product], categoryList, assignedCategories, variants, images] = await Promise.all([
    db.select().from(products).where(eq(products.id, id)),
    db.select().from(categories).orderBy(asc(categories.title)),
    db.select({ categoryId: productCategories.categoryId }).from(productCategories).where(eq(productCategories.productId, id)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.title)),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.position)),
  ]);
  if (!product) notFound();

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">Warenladen Verwaltung</p><h1>{product.title}</h1></div><a className="back-link" href="/admin">Zurück zum Katalog</a></header><AdminProductEditor product={{ ...product, categoryId: assignedCategories[0]?.categoryId ?? "", variants, images }} categories={categoryList.map((category) => ({ id: category.id, title: category.title }))} /></main>;
}