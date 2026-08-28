"use client";

import Link from "next/link";

import { useCart } from "./cart-provider";

export function CartPage() {
  const { items, updateQuantity, removeItem } = useCart();
  const total = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0) / 100);

  if (!items.length) return <p className="empty-cart">Dein Warenkorb ist noch leer. <Link href="/products">Artikel entdecken</Link></p>;

  return <div className="cart-items">
    {items.map((item) => <article className="cart-item" key={item.variantId}>
      <div className={`cart-swatch ${item.tone}`} />
      <div><h2>{item.name}</h2><p>{item.variantTitle}</p><strong>{item.price}</strong></div>
      <div className="cart-quantity"><button aria-label="Menge verringern" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} type="button">−</button><span>{item.quantity}</span><button aria-label="Menge erhöhen" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} type="button">+</button></div>
      <button className="remove-item" onClick={() => removeItem(item.variantId)} type="button">Entfernen</button>
    </article>)}
    <div className="cart-summary"><strong>Gesamtsumme: {total}</strong><Link className="primary-action" href="/checkout">Zur Kasse</Link></div>
  </div>;
}