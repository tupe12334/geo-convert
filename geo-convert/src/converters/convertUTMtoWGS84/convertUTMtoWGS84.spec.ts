import { describe, it, expect } from "vitest";
import { convertUTMtoWGS84 } from "./convertUTMtoWGS84";
import type { UTMCoordinate } from "../types";

describe("convertUTMtoWGS84", () => {
  describe("northern hemisphere conversions", () => {
    it("should convert UTM coordinates to WGS84 (Barcelona, Spain)", () => {
      const utm: UTMCoordinate = {
        easting: 431255,
        northing: 4582677,
        zone: 31,
        hemisphere: "N",
      };

      const result = convertUTMtoWGS84(utm);

      // Barcelona coordinates should be approximately 41.3851° N, 2.1734° E
      expect(result.latitude).toBeCloseTo(41.392689, 3);
      expect(result.longitude).toBeCloseTo(2.177699, 3);
    });
  });

  describe("edge cases", () => {
    it("should handle coordinates at the equator", () => {
      const utm: UTMCoordinate = {
        easting: 500000,
        northing: 0,
        zone: 33,
        hemisphere: "N",
      };

      const result = convertUTMtoWGS84(utm);

      expect(result.latitude).toBeCloseTo(0, 2);
      expect(result.longitude).toBeCloseTo(15, 1); // Zone 33 central meridian
    });

    it("should handle coordinates near zone boundaries", () => {
      const utm: UTMCoordinate = {
        easting: 166021,
        northing: 0,
        zone: 33,
        hemisphere: "N",
      };

      const result = convertUTMtoWGS84(utm);

      expect(result.latitude).toBeCloseTo(0, 2);
      expect(result.longitude).toBeCloseTo(12, 1); // Near zone 32/33 boundary
    });

    it("should handle very large northing values", () => {
      const utm: UTMCoordinate = {
        easting: 500000,
        northing: 9000000,
        zone: 33,
        hemisphere: "N",
      };

      const result = convertUTMtoWGS84(utm);

      expect(result.latitude).toBeGreaterThan(80);
      expect(result.longitude).toBeCloseTo(15, 1);
    });

    it("should handle decimal precision", () => {
      const utm: UTMCoordinate = {
        easting: 500000.123,
        northing: 4649776.456,
        zone: 33,
        hemisphere: "N",
      };

      const result = convertUTMtoWGS84(utm);

      expect(typeof result.latitude).toBe("number");
      expect(typeof result.longitude).toBe("number");
      expect(result.latitude).toBeCloseTo(42.000002, 1);
      expect(result.longitude).toBeCloseTo(15, 1);
    });
  });
});
