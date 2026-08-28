import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local before running db:seed.");
}

const categoryRows = [
  { slug: "kleidung", title: "Kleidung", description: "Kleidung in warmen Farben für den Alltag." },
  { slug: "accessoires", title: "Accessoires", description: "Kleine Details, die ein Outfit besonders machen." },
  { slug: "geschenke", title: "Geschenke", description: "Ausgewählte Stücke zum Verschenken." },
];

const productRows = [
  { slug: "wollmantel-terracotta", title: "Wollmantel in Terrakotta", description: "Ein weicher Mantel mit klarer Silhouette.", priceInCents: 18900, categorySlug: "kleidung", variants: [{ title: "Terrakotta / S", sku: "WM-TER-S", color: "Terrakotta", size: "S", stock: 3 }, { title: "Terrakotta / M", sku: "WM-TER-M", color: "Terrakotta", size: "M", stock: 5 }, { title: "Terrakotta / L", sku: "WM-TER-L", color: "Terrakotta", size: "L", stock: 0 }] },
  { slug: "ledertasche-bernstein", title: "Ledertasche in Bernstein", description: "Kompakte Tasche aus Leder für jeden Tag.", priceInCents: 12400, categorySlug: "accessoires", variants: [{ title: "Bernstein / Einheitsgröße", sku: "LT-BER-OS", color: "Bernstein", size: "Einheitsgröße", stock: 4 }, { title: "Kastanie / Einheitsgröße", sku: "LT-KAS-OS", color: "Kastanie", size: "Einheitsgröße", stock: 2 }] },
  { slug: "seidentuch-rosenholz", title: "Seidentuch in Rosenholz", description: "Leichtes Seidentuch in einer warmen Nuance.", priceInCents: 4600, categorySlug: "accessoires", variants: [{ title: "Rosenholz / Einheitsgröße", sku: "ST-ROS-OS", color: "Rosenholz", size: "Einheitsgröße", stock: 5 }] },
];

async function main(connectionString: string) {
  const [{ drizzle }, { neon }, schema] = await Promise.all([
    import("drizzle-orm/neon-http"),
    import("@neondatabase/serverless"),
    import("./schema"),
  ]);

  const db = drizzle(neon(connectionString));

  await db.insert(schema.categories).values(categoryRows).onConflictDoNothing();
  await db
    .insert(schema.products)
    .values(productRows.map((product) => ({
        slug: product.slug,
        title: product.title,
        description: product.description,
        priceInCents: product.priceInCents,
        status: "active" as const,
        isFeatured: true,
      })))
    .onConflictDoNothing();

  for (const productRow of productRows) {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.slug, productRow.slug));
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, productRow.categorySlug));

    if (!product || !category) throw new Error(`Missing seed record for ${productRow.slug}`);

    await db.insert(schema.productCategories).values({ productId: product.id, categoryId: category.id }).onConflictDoNothing();
    await db.insert(schema.productVariants).values(productRow.variants.map((variant) => ({
      productId: product.id,
      sku: variant.sku,
      title: variant.title,
      attributes: { color: variant.color, size: variant.size },
      priceInCents: productRow.priceInCents,
      stockQuantity: variant.stock,
    }))).onConflictDoNothing();
  }

  console.log("Sample categories and products have been added.");
}

main(databaseUrl).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});