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
  it("should handle general CSV with wgs84 coordinates", () => {
    const csvText = `name,city,country,latitude,longitude
Western Wall,Jerusalem,Israel,31.7767,35.2345
Masada,Dead Sea Region,Israel,31.3156,35.3537
Bahá'í Gardens,Haifa,Israel,32.8167,34.9876
Yad Vashem,Jerusalem,Israel,31.7753,35.1753
Dead Sea,Ein Bokek,Israel,31.5590,35.4732
Empire State Building,New York City,USA,40.7484,-73.9857
Statue of Liberty,New York City,USA,40.6892,-74.0445
Golden Gate Bridge,San Francisco,USA,37.8199,-122.4783
Mount Rushmore,Keystone,USA,43.8791,-103.4591
Grand Canyon,Grand Canyon Village,USA,36.1069,-112.1129
Brandenburg Gate,Berlin,Germany,52.5163,13.3777
Neuschwanstein Castle,Schwangau,Germany,47.5576,10.7498
Cologne Cathedral,Cologne,Germany,50.9413,6.9583
Berlin Wall Memorial,Berlin,Germany,52.5351,13.3904
Heidelberg Castle,Heidelberg,Germany,49.4106,8.7156
`
    const result = parseCSV(csvText);

    expect(result.coordinateType).toBe("WGS84");
    expect(result.detectedColumns).toEqual({
      latitude: "latitude",
      longitude: "longitude",
    });
    expect(result.data.length).toBe(15);
  })
});
