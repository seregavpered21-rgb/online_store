"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; title: string };

export function AdminProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price"));
    const stock = Number(form.get("stock"));
    setError("");
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setError("Bitte gib einen gültigen Preis und Bestand ein.");
      return;
    }
    setIsSaving(true);
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), slug: form.get("slug"), description: form.get("description"), categoryId: form.get("categoryId"), priceInCents: Math.round(price * 100), status: form.get("status"), isFeatured: form.get("isFeatured") === "on", variant: { sku: form.get("sku"), title: form.get("variantTitle"), stockQuantity: stock }, image: form.get("imageUrl") ? { url: form.get("imageUrl"), altText: form.get("imageAlt") } : undefined }) });
    const data = await response.json() as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      setError(data.error ?? "Das Produkt konnte nicht gespeichert werden.");
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  return <form className="admin-form" onSubmit={submit}>
    <div><p className="eyebrow">Neuer Eintrag</p><h2>Produkt anlegen</h2></div>
    <label>Name<input name="title" required maxLength={200} /></label>
    <label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Kleinbuchstaben, Zahlen und Bindestriche" maxLength={160} /></label>
    <label>Beschreibung<textarea name="description" rows={4} /></label>
    <div className="admin-form-row"><label>Preis in EUR<input name="price" type="number" min="0" step="0.01" required /></label><label>Status<select name="status" defaultValue="draft"><option value="draft">Entwurf</option><option value="active">Aktiv</option><option value="archived">Archiviert</option></select></label></div>
    <label>Kategorie<select name="categoryId" required defaultValue=""><option value="" disabled>Kategorie wählen</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label>
    <label className="admin-checkbox"><input name="isFeatured" type="checkbox" /> Als Auswahl hervorheben</label>
    <fieldset><legend>Erste Variante</legend><label>SKU<input name="sku" required maxLength={80} /></label><div className="admin-form-row"><label>Bezeichnung<input name="variantTitle" required maxLength={160} placeholder="z. B. Einheitsgröße" /></label><label>Bestand<input name="stock" type="number" min="0" step="1" defaultValue="0" required /></label></div></fieldset>
    <fieldset><legend>Hauptbild</legend><label>Bild-URL<input name="imageUrl" type="url" placeholder="https://..." /></label><label>Alternativtext<input name="imageAlt" maxLength={240} placeholder="Beschreibung des Bildes" /></label></fieldset>
    {error ? <p className="form-error">{error}</p> : null}
    <button className="primary-action" disabled={isSaving} type="submit">{isSaving ? "Speichert..." : "Produkt speichern"}</button>
  </form>;
}