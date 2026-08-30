export type CartItem = { variantId: string; productSlug: string; name: string; variantTitle: string; price: string; priceInCents: number; tone: string; quantity: number };
export type NewCartItem = Omit<CartItem, "quantity">;

export function addCartItem(items: CartItem[], item: NewCartItem): CartItem[] {
  const existing = items.find((cartItem) => cartItem.variantId === item.variantId);
  return existing ? items.map((cartItem) => cartItem.variantId === item.variantId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem) : [...items, { ...item, quantity: 1 }];
}

export function updateCartItemQuantity(items: CartItem[], variantId: string, quantity: number): CartItem[] {
  return quantity < 1 ? items.filter((item) => item.variantId !== variantId) : items.map((item) => item.variantId === variantId ? { ...item, quantity } : item);
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotalInCents(items: CartItem[]) {
  return items.reduce((total, item) => total + item.priceInCents * item.quantity, 0);
}