"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useCart } from "./cart-provider";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), delivery: form.get("delivery"), address: form.get("address"), items: items.map(({ variantId, quantity }) => ({ variantId, quantity })) }) });
    const result = await response.json() as { error?: string; orderNumber?: string };
    setLoading(false);
    if (!response.ok || !result.orderNumber) return setError(result.error ?? "Die Bestellung konnte nicht gespeichert werden.");
    clearCart(); router.push(`/order-success?number=${result.orderNumber}`);
  }

  if (!items.length) return <p className="empty-cart">Dein Warenkorb ist leer.</p>;
  return <form className="auth-form checkout-form" onSubmit={submit}><label>Name<input name="name" required /></label><label>E-Mail-Adresse<input name="email" required type="email" /></label><label>Telefon<input name="phone" required type="tel" /></label><label>Lieferung<select defaultValue="essen" name="delivery"><option value="essen">Abholung oder Lieferung in Essen</option><option value="post">Versand per Post innerhalb Deutschlands</option></select></label><label>Adresse (für Postversand)<textarea name="address" rows={3} /></label>{error ? <p className="form-error">{error}</p> : null}<button className="primary-action" disabled={loading} type="submit">{loading ? "Wird gespeichert..." : "Zahlung bei Erhalt bestellen"}</button></form>;
}