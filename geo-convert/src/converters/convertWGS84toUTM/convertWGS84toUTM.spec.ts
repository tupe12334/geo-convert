import { describe, it, expect } from "vitest";
import { convertWGS84toUTM } from "./convertWGS84toUTM";
import type { WGS84Coordinate } from "../types";

describe("convertWGS84toUTM", () => {
  describe("northern hemisphere conversions", () => {
    it("should convert WGS84 coordinates to UTM (Barcelona, Spain)", () => {
      const wgs84: WGS84Coordinate = {
        latitude: 41.392689,
        longitude: 2.177699,
      };

      const result = convertWGS84toUTM(wgs84);

      // Barcelona UTM coordinates should be approximately zone 31N, with specific easting/northing
      expect(result.zone).toBe(31);
      expect(result.hemisphere).toBe("N");
      expect(result.easting).toBeCloseTo(431255, 0);
      expect(result.northing).toBeCloseTo(4582677, 0);
    });
  });

  describe("edge cases", () => {
    it("should handle coordinates at the equator", () => {
      const wgs84: WGS84Coordinate = {
        latitude: 0,
        longitude: 15, // Zone 33 central meridian
      };

      const result = convertWGS84toUTM(wgs84);

      expect(result.zone).toBe(33);
      expect(result.hemisphere).toBe("N");
      expect(result.easting).toBeCloseTo(500000, 0);
      expect(result.northing).toBeCloseTo(0, 2);
    });

    it("should handle coordinates near zone boundaries", () => {
      const wgs84: WGS84Coordinate = {
        latitude: 0,
        longitude: 12, // Near zone 32/33 boundary
      };

      const result = convertWGS84toUTM(wgs84);

      expect(result.zone).toBe(33);
      expect(result.hemisphere).toBe("N");
      expect(result.easting).toBeCloseTo(166021, 0);
      expect(result.northing).toBeCloseTo(0, 2);
    });

    it("should handle high latitude coordinates", () => {
      const wgs84: WGS84Coordinate = {
        latitude: 81.0, // Very high latitude
        longitude: 15,
      };

      const result = convertWGS84toUTM(wgs84);

      expect(result.zone).toBe(33);
      expect(result.hemisphere).toBe("N");
      expect(result.easting).toBeCloseTo(500000, 0);
      expect(result.northing).toBeGreaterThan(9000000);
    });

    it("should handle decimal precision", () => {
      const wgs84: WGS84Coordinate = {
        latitude: 42.000002,
        longitude: 15,
      };

      const result = convertWGS84toUTM(wgs84);

      expect(result.zone).toBe(33);
      expect(result.hemisphere).toBe("N");
      expect(typeof result.easting).toBe("number");
      expect(typeof result.northing).toBe("number");
      expect(result.easting).toBeCloseTo(500000.123, 0);
      expect(result.northing).toBeCloseTo(4649776.456, 0);
    });

    it("should handle southern hemisphere coordinates", () => {
      const wgs84: WGS84Coordinate = {
        latitude: -33.8688, // Sydney, Australia
        longitude: 151.2093,
      };

      const result = convertWGS84toUTM(wgs84);

      expect(result.zone).toBe(56);
      expect(result.hemisphere).toBe("S");
      expect(result.easting).toBeCloseTo(334777, 0);
      expect(result.northing).toBeCloseTo(6251341, 0);
    });

    it("should handle custom target zone", () => {
      const wgs84: WGS84Coordinate = {
        latitude: 41.392689,
        longitude: 2.177699,
      };

      const result = convertWGS84toUTM(wgs84, 32);

      expect(result.zone).toBe(32);
      expect(result.hemisphere).toBe("N");
      // Should still convert correctly even with different zone
      expect(typeof result.easting).toBe("number");
      expect(typeof result.northing).toBe("number");
    });
  });
});
