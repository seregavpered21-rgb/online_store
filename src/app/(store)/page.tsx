import Link from "next/link";

import { StoreHeader } from "@/components/layout/store-header";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/catalog/queries";

export default async function Home() {
  const featuredProducts = (await getProducts()).slice(0, 3);

  return (
    <main>
      <StoreHeader />

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Warm. Alltagstauglich. Besonders.</p>
          <h1>Ein Lieblingsstuck fur jeden Tag.</h1>
          <p className="intro">
            Sorgfaltig ausgewahlte Kleidung und Accessoires in warmen Farben - fur
            Menschen, die Dinge mit Charakter lieben.
          </p>
          <Link className="primary-action" href="/products">
            Kollektion entdecken
          </Link>
        </div>
        <div className="hero-art" aria-label="Auswahl warmer Accessoires" role="img">
          <div className="sun" />
          <div className="coat" />
          <div className="bag" />
          <p>01 / Herbst</p>
        </div>
      </section>

      <section className="catalog" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading">
          <p className="eyebrow">Ausgewahlt fur dich</p>
          <h2 id="catalog-title">Stucke, die sich sofort richtig anfuhlen</h2>
          <Link href="/products">Alle Artikel</Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product, index) => <ProductCard product={product} index={index} key={product.slug} />)}
        </div>
      </section>

      <section className="promise" aria-label="Unser Service">
        <p>Persönlich ausgewählt. Liebevoll verpackt. Abholung in Essen oder Versand per Post.</p>
      </section>
    </main>
  );
}