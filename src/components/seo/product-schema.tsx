type ProductSchemaProps = {
  product: { name: string; description: string; priceInCents: number; slug: string; inStock: boolean };
};

export function ProductSchema({ product }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    offers: {
      "@type": "Offer",
      price: (product.priceInCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return <script dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} type="application/ld+json" />;
}