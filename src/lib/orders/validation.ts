export type OrderItemInput = { variantId?: unknown; quantity?: unknown };
export type OrderRequestInput = { name?: unknown; email?: unknown; phone?: unknown; delivery?: unknown; address?: unknown; items?: OrderItemInput[] };
export type RequestedItem = { variantId: string; quantity: number };

export function getValidOrderItems(items: OrderItemInput[] | undefined): RequestedItem[] {
  return items?.filter((item): item is RequestedItem => typeof item.variantId === "string" && typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0) ?? [];
}

export function validateOrderRequest(body: OrderRequestInput, items: RequestedItem[]): string | undefined {
  if (typeof body.name !== "string" || !body.name.trim() || typeof body.email !== "string" || !body.email.includes("@") || typeof body.phone !== "string" || !body.phone.trim() || (body.delivery !== "essen" && body.delivery !== "post") || !items.length) return "Bitte fülle alle Pflichtfelder aus.";
  if (body.delivery === "post" && (typeof body.address !== "string" || !body.address.trim())) return "Bitte gib deine Lieferadresse an.";
}

export function consolidateOrderItems(items: RequestedItem[]): RequestedItem[] {
  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  return [...quantities].map(([variantId, quantity]) => ({ variantId, quantity }));
}

export function createOrderNumber(now = Date.now()) {
  return `WL-${now.toString().slice(-8)}`;
}