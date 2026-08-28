import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductSchema } from "@/components/seo/product-schema";
import { StoreHeader } from "@/components/layout/store-header";
import { ProductOptions } from "@/components/product/product-options";
import { getProductBySlug } from "@/lib/catalog/queries";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description, alternates: { canonical: `/products/${product.slug}` }, openGraph: { title: product.name, description: product.description } };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main>
      <StoreHeader />
      <ProductSchema product={product} />
      <section className="product-detail">
        <div className={`product-detail-image ${product.tone}`}><div className="product-shape" /></div>
        <div className="product-detail-copy">
          <p className="eyebrow">{product.label}</p>
          <h1>{product.name}</h1>
          <strong className="detail-price">{product.price}</strong>
          <p>{product.description}</p>
          <ProductOptions product={product} variants={product.variants} />
          <Link className="back-link" href="/products">Zurück zur Auswahl</Link>
        </div>
      </section>
    </main>
  );
}