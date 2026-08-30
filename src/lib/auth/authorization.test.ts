import { describe, expect, it } from "vitest";

import { isAdminSession } from "./authorization";

describe("admin authorization", () => {
  it("denies missing and customer sessions", () => {
    expect(isAdminSession(null)).toBe(false);
    expect(isAdminSession({ user: { role: "customer" } })).toBe(false);
  });

  it("allows only explicit admin roles", () => {
    expect(isAdminSession({ user: { role: "admin" } })).toBe(true);
    expect(isAdminSession({ user: { role: "Admin" } })).toBe(false);
  });
});