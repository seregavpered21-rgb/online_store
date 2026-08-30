import { describe, expect, it } from "vitest";

import { consolidateOrderItems, createOrderNumber, getValidOrderItems, validateOrderRequest } from "./validation";

describe("order validation", () => {
  it("rejects an incomplete order", () => {
    const items = getValidOrderItems([{ variantId: "variant-1", quantity: 1 }]);
    expect(validateOrderRequest({ name: "", email: "buyer@example.com", phone: "123", delivery: "essen" }, items)).toBe("Bitte fülle alle Pflichtfelder aus.");
  });

  it("requires an address for postal delivery", () => {
    const items = getValidOrderItems([{ variantId: "variant-1", quantity: 1 }]);
    expect(validateOrderRequest({ name: "Buyer", email: "buyer@example.com", phone: "123", delivery: "post", address: "" }, items)).toBe("Bitte gib deine Lieferadresse an.");
  });

  it("filters malformed cart items and combines matching variants", () => {
    const items = getValidOrderItems([{ variantId: "variant-1", quantity: 1 }, { variantId: "variant-1", quantity: 2 }, { variantId: "variant-2", quantity: 0 }, { variantId: 4, quantity: 1 }]);
    expect(consolidateOrderItems(items)).toEqual([{ variantId: "variant-1", quantity: 3 }]);
  });

  it("creates stable order numbers from the clock", () => {
    expect(createOrderNumber(1_728_000_123_456)).toBe("WL-00123456");
  });
});