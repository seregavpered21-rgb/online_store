import { describe, expect, it } from "vitest";

import { addCartItem, getCartItemCount, getCartTotalInCents, updateCartItemQuantity, type CartItem, type NewCartItem } from "./cart";

const tea: CartItem = { variantId: "tea", productSlug: "tea", name: "Tee", variantTitle: "100 g", price: "4,50 EUR", priceInCents: 450, tone: "lime", quantity: 2 };
const soap: CartItem = { variantId: "soap", productSlug: "soap", name: "Seife", variantTitle: "1 Stück", price: "3,00 EUR", priceInCents: 300, tone: "rust", quantity: 1 };
const teaToAdd: NewCartItem = { variantId: "tea", productSlug: "tea", name: "Tee", variantTitle: "100 g", price: "4,50 EUR", priceInCents: 450, tone: "lime" };

describe("cart operations", () => {
  it("adds a new variant and increments an existing one", () => {
    expect(addCartItem([tea], soap)).toEqual([tea, soap]);
    expect(addCartItem([tea], teaToAdd)).toEqual([{ ...tea, quantity: 3 }]);
  });

  it("updates quantity and removes items below one", () => {
    expect(updateCartItemQuantity([tea, soap], "tea", 4)).toEqual([{ ...tea, quantity: 4 }, soap]);
    expect(updateCartItemQuantity([tea, soap], "soap", 0)).toEqual([tea]);
  });

  it("calculates cart count and total from quantities", () => {
    expect(getCartItemCount([tea, soap])).toBe(3);
    expect(getCartTotalInCents([tea, soap])).toBe(1200);
  });
});