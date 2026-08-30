"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { addCartItem, getCartItemCount, updateCartItemQuantity, type CartItem, type NewCartItem } from "@/lib/cart";

export type { CartItem } from "@/lib/cart";
type CartContextValue = { items: CartItem[]; itemCount: number; addItem: (item: NewCartItem) => void; updateQuantity: (variantId: string, quantity: number) => void; removeItem: (variantId: string) => void; clearCart: () => void };

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "warenladen-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) startTransition(() => setItems(JSON.parse(stored) as CartItem[]));
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const guestItems = items.map(({ variantId, quantity }) => ({ variantId, quantity }));
    void fetch("/api/cart/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: guestItems }) })
      .then((response) => response.status === 200 ? response.json() as Promise<{ merged: boolean }> : undefined)
      .then((result) => {
        if (result?.merged) {
          setItems([]);
          window.localStorage.removeItem(storageKey);
        }
      });
  }, [items]);

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(storageKey, JSON.stringify(nextItems));
  }

  function addItem(item: NewCartItem) {
    updateItems(addCartItem(items, item));
  }

  function updateQuantity(variantId: string, quantity: number) {
    updateItems(updateCartItemQuantity(items, variantId, quantity));
  }

  function removeItem(variantId: string) { updateItems(items.filter((item) => item.variantId !== variantId)); }
  function clearCart() { updateItems([]); }

  return <CartContext.Provider value={{ items, itemCount: getCartItemCount(items), addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}