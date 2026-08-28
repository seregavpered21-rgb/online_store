import { notFound } from "next/navigation";

import { StoreHeader } from "@/components/layout/store-header";
import { ProductCard } from "@/components/product/product-card";
import { getCategoryBySlug } from "@/lib/catalog/queries";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  return (
    <main>
      <StoreHeader />
      <section className="catalog catalog-page" aria-labelledby="category-title">
        <p className="eyebrow">Kollektion</p>
        <h1 id="category-title" className="page-title">{category.title}</h1>
        <p className="category-description">{category.description}</p>
        <div className="product-grid">
          {category.products.map((product, index) => <ProductCard product={product} index={index} key={product.slug} />)}
        </div>
      </section>
    </main>
  );
}