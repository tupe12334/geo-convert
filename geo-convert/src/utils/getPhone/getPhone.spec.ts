import { describe, it, expect } from "vitest";
import { getPhone } from "./getPhone";

describe("getPhone", () => {
  it("should return phone from env", () => {
    const phone = getPhone({ VITE_PHONE: "123" });
    expect(phone).toBe("123");
  });

  it("should throw when phone missing", () => {
    expect(() => getPhone({})).toThrow();
  });
});
