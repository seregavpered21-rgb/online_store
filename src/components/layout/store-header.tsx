import Link from "next/link";

import { CartLink } from "@/components/cart/cart-link";
import { getNavigationCategories } from "@/lib/catalog/queries";

export async function StoreHeader() {
  const categories = await getNavigationCategories();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Warenladen, zur Startseite">
        WARENLADEN
      </Link>
      <nav aria-label="Hauptnavigation">
        {categories.map((category) => (
          <Link href={`/categories/${category.slug}`} key={category.id}>
            {category.title}
          </Link>
        ))}
      </nav>
      <Link className="account-link" href="/account">Konto</Link>
      <CartLink />
    </header>
  );
}