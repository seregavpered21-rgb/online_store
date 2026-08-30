import { describe, expect, it } from "vitest";

import { canTransitionOrderStatus, isOrderStatus } from "./status";

describe("order status transitions", () => {
  it("allows the operational order workflow", () => {
    expect(canTransitionOrderStatus("new", "confirmed")).toBe(true);
    expect(canTransitionOrderStatus("confirmed", "fulfilled")).toBe(true);
    expect(canTransitionOrderStatus("confirmed", "cancelled")).toBe(true);
  });

  it("rejects reverse and terminal transitions", () => {
    expect(canTransitionOrderStatus("new", "fulfilled")).toBe(false);
    expect(canTransitionOrderStatus("fulfilled", "cancelled")).toBe(false);
    expect(canTransitionOrderStatus("cancelled", "confirmed")).toBe(false);
  });

  it("accepts only defined statuses", () => {
    expect(isOrderStatus("confirmed")).toBe(true);
    expect(isOrderStatus("paid")).toBe(false);
  });
});