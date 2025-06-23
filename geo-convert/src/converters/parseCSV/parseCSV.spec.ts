import { describe, it, expect } from "vitest";
import { parseCSV } from "./parseCSV";

describe("parseCSV", () => {
  it("should parse basic CSV with headers", () => {
    const csvText = `name,value
John,123
Jane,456`;

    const result = parseCSV(csvText);

    expect(result.headers).toEqual(["name", "value"]);
    expect(result.data).toEqual([
      { name: "John", value: "123" },
      { name: "Jane", value: "456" },
    ]);
  });

  it("should handle quoted CSV values", () => {
    const csvText = `name,description
"John Doe","A person with, comma"
Jane,"Simple description"`;

    const result = parseCSV(csvText);

    expect(result.data).toEqual([
      { name: "John Doe", description: "A person with, comma" },
      { name: "Jane", description: "Simple description" },
    ]);
  });

  it("should detect UTM coordinates", () => {
    const csvText = `easting,northing,zone,hemisphere
500000,4649776,33,N
501000,4650000,33,N`;

    const result = parseCSV(csvText);

    expect(result.coordinateType).toBe("UTM");
    expect(result.detectedColumns).toEqual({
      easting: "easting",
      northing: "northing",
      zone: "zone",
      hemisphere: "hemisphere",
    });
  });

  it("should detect WGS84 coordinates", () => {
    const csvText = `latitude,longitude,name
41.123456,2.123456,Barcelona
40.123456,3.123456,Madrid`;

    const result = parseCSV(csvText);

    expect(result.coordinateType).toBe("WGS84");
    expect(result.detectedColumns).toEqual({
      latitude: "latitude",
      longitude: "longitude",
    });
  });

  it("should detect alternative column names", () => {
    const csvText = `lat,lon,place
41.123456,2.123456,Barcelona
40.123456,3.123456,Madrid`;

    const result = parseCSV(csvText);

    expect(result.coordinateType).toBe("WGS84");
    expect(result.detectedColumns).toEqual({
      latitude: "lat",
      longitude: "lon",
    });
  });

  it("should throw error for empty CSV", () => {
    expect(() => parseCSV("")).toThrow(
      "CSV file must contain at least a header and one data row"
    );
  });

  it("should throw error for CSV with only headers", () => {
    expect(() => parseCSV("header1,header2")).toThrow(
      "CSV file must contain at least a header and one data row"
    );
  });

  it("should not detect coordinate type for invalid data", () => {
    const csvText = `easting,northing
invalid,data
more,invalid`;

    const result = parseCSV(csvText);

    expect(result.coordinateType).toBeUndefined();
  });

  it("should handle missing values in rows", () => {
    const csvText = `name,value,extra
John,123
Jane,456,additional`;

    const result = parseCSV(csvText);

    expect(result.data).toEqual([
      { name: "John", value: "123", extra: "" },
      { name: "Jane", value: "456", extra: "additional" },
    ]);
  });
});
