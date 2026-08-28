"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = { variantId: string; productSlug: string; name: string; variantTitle: string; price: string; priceInCents: number; tone: string; quantity: number };
type NewCartItem = Omit<CartItem, "quantity">;
type CartContextValue = { items: CartItem[]; itemCount: number; addItem: (item: NewCartItem) => void; updateQuantity: (variantId: string, quantity: number) => void; removeItem: (variantId: string) => void; clearCart: () => void };

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "warenladen-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as CartItem[] : [];
  });

  useEffect(() => {
    if (!items.length) return;
    const guestItems = items.map(({ variantId, quantity }) => ({ variantId, quantity }));
    void fetch("/api/cart/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: guestItems }) })
      .then((response) => response.ok ? response.json() as Promise<{ merged: boolean }> : undefined)
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
    const existing = items.find((cartItem) => cartItem.variantId === item.variantId);
    updateItems(existing ? items.map((cartItem) => cartItem.variantId === item.variantId ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem) : [...items, { ...item, quantity: 1 }]);
  }

  function updateQuantity(variantId: string, quantity: number) {
    updateItems(quantity < 1 ? items.filter((item) => item.variantId !== variantId) : items.map((item) => item.variantId === variantId ? { ...item, quantity } : item));
  }

  function removeItem(variantId: string) { updateItems(items.filter((item) => item.variantId !== variantId)); }
  function clearCart() { updateItems([]); }

  return <CartContext.Provider value={{ items, itemCount: items.reduce((total, item) => total + item.quantity, 0), addItem, updateQuantity, removeItem, clearCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}