import { config } from "dotenv";

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
  { slug: "wollmantel-terracotta", title: "Wollmantel in Terrakotta", description: "Ein weicher Mantel mit klarer Silhouette.", priceInCents: 18900 },
  { slug: "ledertasche-bernstein", title: "Ledertasche in Bernstein", description: "Kompakte Tasche aus Leder für jeden Tag.", priceInCents: 12400 },
  { slug: "seidentuch-rosenholz", title: "Seidentuch in Rosenholz", description: "Leichtes Seidentuch in einer warmen Nuance.", priceInCents: 4600 },
];

async function main() {
  const [{ drizzle }, { neon }, schema] = await Promise.all([
    import("drizzle-orm/neon-http"),
    import("@neondatabase/serverless"),
    import("./schema"),
  ]);

  const db = drizzle(neon(databaseUrl));

  await db.insert(schema.categories).values(categoryRows).onConflictDoNothing();
  await db
    .insert(schema.products)
    .values(productRows.map((product) => ({ ...product, status: "active" as const, isFeatured: true })))
    .onConflictDoNothing();

  console.log("Sample categories and products have been added.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});