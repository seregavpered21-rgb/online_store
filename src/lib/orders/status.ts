export const orderStatuses = ["new", "confirmed", "fulfilled", "cancelled"] as const;
export type OrderStatus = typeof orderStatuses[number];

const transitions: Record<OrderStatus, OrderStatus[]> = { new: ["confirmed", "cancelled"], confirmed: ["fulfilled", "cancelled"], fulfilled: [], cancelled: [] };

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && orderStatuses.includes(value as OrderStatus);
}

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  return transitions[currentStatus].includes(nextStatus);
}