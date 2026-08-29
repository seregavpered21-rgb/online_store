import Link from "next/link";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    price: string;
    tone: string;
    label: string;
    imageUrl?: string;
  };
  index: number;
};

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link className={`product-image ${product.tone}`} href={`/products/${product.slug}`}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <div className="product-shape" />}
      </Link>
      <p>{product.label}</p>
      <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
      <strong>{product.price}</strong>
    </article>
  );
}