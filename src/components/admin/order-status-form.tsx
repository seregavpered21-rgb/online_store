"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "new" | "confirmed" | "fulfilled" | "cancelled";
const transitions: Record<OrderStatus, OrderStatus[]> = { new: ["confirmed", "cancelled"], confirmed: ["fulfilled", "cancelled"], fulfilled: [], cancelled: [] };
const labels: Record<OrderStatus, string> = { new: "Neu", confirmed: "Bestätigt", fulfilled: "Erfüllt", cancelled: "Storniert" };

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const choices = transitions[currentStatus];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === currentStatus) return;
    setError("");
    setIsSaving(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json() as { error?: string };
    setIsSaving(false);
    if (!response.ok) return setError(data.error ?? "Der Status konnte nicht gespeichert werden.");
    router.refresh();
  }

  if (!choices.length) return <p className={`status status-order-${currentStatus}`}>{labels[currentStatus]}</p>;
  return <form className="order-status-form" onSubmit={submit}><label>Aktueller Status<select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}><option value={currentStatus}>{labels[currentStatus]}</option>{choices.map((choice) => <option key={choice} value={choice}>{labels[choice]}</option>)}</select></label>{error ? <p className="form-error">{error}</p> : null}<button className="primary-action" disabled={status === currentStatus || isSaving} type="submit">{isSaving ? "Speichert..." : "Status speichern"}</button></form>;
}