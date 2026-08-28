const categories = ["Новинки", "Одежда", "Аксессуары", "Подарки"];

const products = [
  { name: "Пальто из шерсти", price: "18 900 ₽", tone: "clay", label: "Новая коллекция" },
  { name: "Кожаная сумка", price: "12 400 ₽", tone: "ochre", label: "Выбор недели" },
  { name: "Шёлковый платок", price: "4 600 ₽", tone: "rose", label: "Лимитированный тираж" },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="NOVA, на главную">
          NOVA
        </a>
        <nav aria-label="Основная навигация">
          {categories.map((category) => (
            <a href="#catalog" key={category}>
              {category}
            </a>
          ))}
        </nav>
        <a className="cart-link" href="#cart">
          Корзина <span>0</span>
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Вещи с характером</p>
          <h1>Ваша новая любимая вещь уже здесь.</h1>
          <p className="intro">
            Небольшая коллекция одежды и деталей, которые хочется носить каждый день.
          </p>
          <a className="primary-action" href="#catalog">
            Смотреть коллекцию
          </a>
        </div>
        <div className="hero-art" aria-label="Подборка аксессуаров" role="img">
          <div className="sun" />
          <div className="coat" />
          <div className="bag" />
          <p>01 / осень</p>
        </div>
      </section>

      <section className="catalog" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading">
          <p className="eyebrow">Избранное</p>
          <h2 id="catalog-title">Собрано с вниманием к каждой детали</h2>
          <a href="#all-products">Все товары</a>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.name}>
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

      <section className="promise" aria-label="О магазине">
        <p>Честный выбор. Бережная упаковка. Доставка по всей России.</p>
      </section>
    </main>
  );
}
