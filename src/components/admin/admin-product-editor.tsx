"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; title: string };
type Variant = { id: string; sku: string; title: string; stockQuantity: number };
type Image = { id: string; url: string; altText: string };
type Product = { id: string; title: string; slug: string; description: string | null; categoryId: string; priceInCents: number; status: "draft" | "active" | "archived"; isFeatured: boolean; variants: Variant[]; images: Image[] };

export function AdminProductEditor({ product, categories }: { product: Product; categories: Category[] }) {
  const router = useRouter();
  const [variants, setVariants] = useState(product.variants);
  const [images, setImages] = useState(product.images);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function updateVariant(index: number, field: keyof Variant, value: string | number) {
    setVariants((current) => current.map((variant, variantIndex) => variantIndex === index ? { ...variant, [field]: value } : variant));
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setIsUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/admin/images", { method: "POST", body: formData });
    const data = await response.json() as { url?: string; error?: string };
    setIsUploading(false);
    event.target.value = "";
    if (!response.ok || !data.url) return setError(data.error ?? "Das Bild konnte nicht hochgeladen werden.");
    setImages((current) => [...current, { id: crypto.randomUUID(), url: data.url!, altText: "" }]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price"));
    const validVariants = variants.every((variant) => variant.sku.trim() && variant.title.trim() && Number.isInteger(variant.stockQuantity) && variant.stockQuantity >= 0);
    const validImages = images.every((image) => image.url && image.altText.trim());
    setError("");
    if (!Number.isFinite(price) || price < 0 || !validVariants || !validImages) return setError("Bitte überprüfe Preis, Varianten und Bildbeschreibungen.");
    setIsSaving(true);
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), slug: form.get("slug"), description: form.get("description"), categoryId: form.get("categoryId"), priceInCents: Math.round(price * 100), status: form.get("status"), isFeatured: form.get("isFeatured") === "on", variants, images }) });
    const data = await response.json() as { error?: string };
    setIsSaving(false);
    if (!response.ok) return setError(data.error ?? "Das Produkt konnte nicht gespeichert werden.");
    router.refresh();
  }

  return <form className="admin-editor" onSubmit={submit}>
    <section className="admin-form"><label>Name<input name="title" defaultValue={product.title} required maxLength={200} /></label><label>Slug<input name="slug" defaultValue={product.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={160} /></label><label>Beschreibung<textarea name="description" defaultValue={product.description ?? ""} rows={5} /></label><div className="admin-form-row"><label>Preis in EUR<input name="price" type="number" min="0" step="0.01" defaultValue={(product.priceInCents / 100).toFixed(2)} required /></label><label>Status<select name="status" defaultValue={product.status}><option value="draft">Entwurf</option><option value="active">Aktiv</option><option value="archived">Archiviert</option></select></label></div><label>Kategorie<select name="categoryId" defaultValue={product.categoryId} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label><label className="admin-checkbox"><input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} /> Als Auswahl hervorheben</label></section>
    <section className="admin-editor-section"><div className="admin-section-heading"><div><p className="eyebrow">Varianten</p><h2>Größen und Bestand</h2></div><button className="text-action" onClick={() => setVariants((current) => [...current, { id: "", sku: "", title: "", stockQuantity: 0 }])} type="button">Variante hinzufügen</button></div>{variants.map((variant, index) => <div className="variant-row" key={variant.id || index}><label>SKU<input value={variant.sku} maxLength={80} onChange={(event) => updateVariant(index, "sku", event.target.value)} required /></label><label>Bezeichnung<input value={variant.title} maxLength={160} onChange={(event) => updateVariant(index, "title", event.target.value)} required /></label><label>Bestand<input type="number" min="0" step="1" value={variant.stockQuantity} onChange={(event) => updateVariant(index, "stockQuantity", Number(event.target.value))} required /></label></div>)}</section>
    <section className="admin-editor-section"><div className="admin-section-heading"><div><p className="eyebrow">Bilder</p><h2>Produktansichten</h2></div><label className="file-action">{isUploading ? "Lädt hoch..." : "Bild hochladen"}<input accept="image/jpeg,image/png,image/webp,image/gif" disabled={isUploading} onChange={uploadImage} type="file" /></label></div>{images.length ? <div className="image-editor-grid">{images.map((image, index) => <article key={image.id}><img src={image.url} alt="" /><label>Alternativtext<input value={image.altText} maxLength={240} onChange={(event) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, altText: event.target.value } : item))} required /></label><button className="text-action" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button">Entfernen</button></article>)}</div> : <p>Noch keine Bilder hinterlegt.</p>}</section>
    {error ? <p className="form-error">{error}</p> : null}<button className="primary-action" disabled={isSaving || isUploading} type="submit">{isSaving ? "Speichert..." : "Änderungen speichern"}</button>
  </form>;
}