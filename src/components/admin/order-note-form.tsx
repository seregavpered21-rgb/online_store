"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function OrderNoteForm({ orderId, initialNote }: { orderId: string; initialNote: string | null }) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminNote: note }) });
    const data = await response.json() as { error?: string };
    setIsSaving(false);
    if (!response.ok) return setError(data.error ?? "Die Notiz konnte nicht gespeichert werden.");
    router.refresh();
  }

  return <form className="order-note-form" onSubmit={submit}><label>Interne Notiz<textarea maxLength={2000} onChange={(event) => setNote(event.target.value)} rows={5} value={note} /></label>{error ? <p className="form-error">{error}</p> : null}<button className="primary-action" disabled={isSaving} type="submit">{isSaving ? "Speichert..." : "Notiz speichern"}</button></form>;
}