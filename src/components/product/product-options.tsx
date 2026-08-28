"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";

type Variant = { id: string; title: string; color: string; size: string; inStock: boolean };

type ProductOptionsProps = { variants: Variant[]; product: { slug: string; name: string; price: string; priceInCents: number; tone: string } };

export function ProductOptions({ variants, product }: ProductOptionsProps) {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState(variants.find((variant) => variant.inStock)?.id ?? variants[0]?.id);
  const selected = variants.find((variant) => variant.id === selectedId);
  const colors = [...new Set(variants.map((variant) => variant.color))];
  const sizes = [...new Set(variants.filter((variant) => variant.color === selected?.color).map((variant) => variant.size))];

  return (
    <div className="product-options">
      <p>Farbe: <strong>{selected?.color}</strong></p>
      <div className="option-list">
        {colors.map((color) => {
          const variant = variants.find((item) => item.color === color);
          return <button className={variant?.id === selectedId ? "selected" : ""} key={color} onClick={() => { if (variant) setSelectedId(variant.id); }} type="button">{color}</button>;
        })}
      </div>
      <p>Größe: <strong>{selected?.size}</strong></p>
      <div className="option-list">
        {sizes.map((size) => {
          const variant = variants.find((item) => item.color === selected?.color && item.size === size);
          return <button className={variant?.id === selectedId ? "selected" : ""} disabled={!variant?.inStock} key={size} onClick={() => { if (variant) setSelectedId(variant.id); }} type="button">{size}</button>;
        })}
      </div>
      <button type="button" className="primary-action" disabled={!selected?.inStock} onClick={() => selected && addItem({ variantId: selected.id, variantTitle: selected.title, productSlug: product.slug, name: product.name, price: product.price, priceInCents: product.priceInCents, tone: product.tone })}>{selected?.inStock ? "In den Warenkorb" : "Nicht verfügbar"}</button>
    </div>
  );
}