import { StoreHeader } from "@/components/layout/store-header";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/catalog/queries";

type ProductsPageProps = { searchParams: Promise<{ query?: string; category?: string; sort?: "featured" | "price-asc" | "price-desc" }> };

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = await searchParams;
  const products = await getProducts(filters);

  return (
    <main>
      <StoreHeader />
      <section className="catalog catalog-page" aria-labelledby="products-title">
        <p className="eyebrow">Unsere Auswahl</p>
        <h1 id="products-title" className="page-title">Alle Artikel</h1>
        <form className="catalog-filters">
          <input aria-label="Artikel suchen" defaultValue={filters.query} name="query" placeholder="Artikel suchen" type="search" />
          <select aria-label="Kategorie" defaultValue={filters.category} name="category"><option value="">Alle Kategorien</option><option value="kleidung">Kleidung</option><option value="accessoires">Accessoires</option><option value="geschenke">Geschenke</option></select>
          <select aria-label="Sortierung" defaultValue={filters.sort ?? "featured"} name="sort"><option value="featured">Ausgewählt</option><option value="price-asc">Preis: niedrig zuerst</option><option value="price-desc">Preis: hoch zuerst</option></select>
          <button type="submit">Anwenden</button>
        </form>
        {products.length === 0 ? <p className="empty-results">Keine Artikel gefunden.</p> : null}
        <div className="product-grid">
          {products.map((product, index) => <ProductCard product={product} index={index} key={product.slug} />)}
        </div>
      </section>
    </main>
  );
}