import { describe, it, expect } from "vitest";
import { parseUTMInputs } from "./parseUTMInputs";

describe("parseUTMInputs", () => {
  describe("valid inputs", () => {
    it("should parse valid UTM coordinates with northern hemisphere", () => {
      const result = parseUTMInputs("500000", "4649776", "33", "N");

      expect(result).toEqual({
        easting: 500000,
        northing: 4649776,
        zone: 33,
        hemisphere: "N",
      });
    });

    it("should parse valid UTM coordinates with southern hemisphere", () => {
      const result = parseUTMInputs("500000", "4649776", "33", "S");

      expect(result).toEqual({
        easting: 500000,
        northing: 4649776,
        zone: 33,
        hemisphere: "S",
      });
    });

    it("should handle decimal coordinates", () => {
      const result = parseUTMInputs("500000.5", "4649776.25", "33", "N");

      expect(result).toEqual({
        easting: 500000.5,
        northing: 4649776.25,
        zone: 33,
        hemisphere: "N",
      });
    });

    it("should handle string inputs with whitespace", () => {
      const result = parseUTMInputs(
        "  500000  ",
        "  4649776  ",
        "  33  ",
        "  N  "
      );

      expect(result).toEqual({
        easting: 500000,
        northing: 4649776,
        zone: 33,
        hemisphere: "N",
      });
    });

    it("should handle lowercase hemisphere", () => {
      const result = parseUTMInputs("500000", "4649776", "33", "n");

      expect(result).toEqual({
        easting: 500000,
        northing: 4649776,
        zone: 33,
        hemisphere: "N",
      });
    });

    it("should handle boundary zone values", () => {
      const result1 = parseUTMInputs("500000", "4649776", "1", "N");
      expect(result1?.zone).toBe(1);

      const result2 = parseUTMInputs("500000", "4649776", "60", "N");
      expect(result2?.zone).toBe(60);
    });
  });

  describe("invalid inputs", () => {
    it("should return null for non-numeric easting", () => {
      const result = parseUTMInputs("abc", "4649776", "33", "N");
      expect(result).toBeNull();
    });

    it("should return null for non-numeric northing", () => {
      const result = parseUTMInputs("500000", "abc", "33", "N");
      expect(result).toBeNull();
    });

    it("should return null for non-numeric zone", () => {
      const result = parseUTMInputs("500000", "4649776", "abc", "N");
      expect(result).toBeNull();
    });

    it("should return null for invalid hemisphere", () => {
      const result = parseUTMInputs("500000", "4649776", "33", "X");
      expect(result).toBeNull();
    });

    it("should return null for empty hemisphere", () => {
      const result = parseUTMInputs("500000", "4649776", "33", "");
      expect(result).toBeNull();
    });

    it("should return null for zone less than 1", () => {
      const result = parseUTMInputs("500000", "4649776", "0", "N");
      expect(result).toBeNull();
    });

    it("should return null for zone greater than 60", () => {
      const result = parseUTMInputs("500000", "4649776", "61", "N");
      expect(result).toBeNull();
    });

    it("should return null for empty easting", () => {
      const result = parseUTMInputs("", "4649776", "33", "N");
      expect(result).toBeNull();
    });

    it("should return null for empty northing", () => {
      const result = parseUTMInputs("500000", "", "33", "N");
      expect(result).toBeNull();
    });

    it("should return null for empty zone", () => {
      const result = parseUTMInputs("500000", "4649776", "", "N");
      expect(result).toBeNull();
    });

    it("should return null for negative zone", () => {
      const result = parseUTMInputs("500000", "4649776", "-1", "N");
      expect(result).toBeNull();
    });
  });
});
