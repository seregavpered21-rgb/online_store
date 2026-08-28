import { categories, featuredProducts } from "@/lib/catalog/sample-data";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Warenladen, zur Startseite">
          WARENLADEN
        </a>
        <nav aria-label="Hauptnavigation">
          {categories.map((category) => (
            <a href="#catalog" key={category}>
              {category}
            </a>
          ))}
        </nav>
        <a className="cart-link" href="#cart">
          Warenkorb <span>0</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Warm. Alltagstauglich. Besonders.</p>
          <h1>Ein Lieblingsstuck fur jeden Tag.</h1>
          <p className="intro">
            Sorgfaltig ausgewahlte Kleidung und Accessoires in warmen Farben - fur
            Menschen, die Dinge mit Charakter lieben.
          </p>
          <a className="primary-action" href="#catalog">
            Kollektion entdecken
          </a>
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
          <a href="#all-products">Alle Artikel</a>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product, index) => (
            <article className="product-card" key={product.slug}>
              <div className={`product-image ${product.tone}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="product-shape" />
              </div>
              <p>{product.label}</p>
              <h3>{product.name}</h3>
              <strong>{product.price}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="promise" aria-label="Unser Service">
        <p>Persönlich ausgewählt. Liebevoll verpackt. Abholung in Essen oder Versand per Post.</p>
      </section>
    </main>
  );
}