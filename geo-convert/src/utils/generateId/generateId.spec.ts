import { describe, it, expect } from "vitest";
import { generateId } from "./generateId";

describe("generateId", () => {
  it("should produce unique identifiers", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("should return a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
