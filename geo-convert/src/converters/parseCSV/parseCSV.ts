import type { CSVParseResult, CSVRow, CoordinateType } from "./types";

/**
 * Parses a CSV file and attempts to detect coordinate type and relevant columns
 * @param csvText - The raw CSV text content
 * @returns Parsed CSV data with detected coordinate information
 */
export const parseCSV = (csvText: string): CSVParseResult => {
  const lines = csvText.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header and one data row");
  }

  const headers = parseCSVLine(lines[0]);
  const data: CSVRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    data.push(row);
  }

  // Detect coordinate type and columns
  const detectionResult = detectCoordinateType(headers, data);

  return {
    data,
    headers,
    ...detectionResult,
  };
};

/**
 * Parses a single CSV line, handling quoted values and commas
 * @param line - The CSV line to parse
 * @returns Array of values
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

/**
 * Attempts to detect coordinate type and relevant columns
 * @param headers - CSV headers
 * @param data - CSV data rows
 * @returns Detection result with coordinate type and column mappings
 */
const detectCoordinateType = (headers: string[], data: CSVRow[]) => {
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  // Common UTM column patterns
  const utmPatterns = {
    easting: ["easting", "east", "x", "utm_x", "utm_easting"],
    northing: ["northing", "north", "y", "utm_y", "utm_northing"],
    zone: ["zone", "utm_zone", "zone_number"],
    hemisphere: ["hemisphere", "utm_hemisphere", "ns", "north_south"],
  };

  // Common WGS84 column patterns
  const wgs84Patterns = {
    latitude: ["latitude", "lat", "y", "wgs84_lat"],
    longitude: ["longitude", "lon", "lng", "long", "x", "wgs84_lon"],
  };

  const detectedColumns: any = {};

  // Try to detect UTM columns
  const utmMatches = Object.entries(utmPatterns).map(([key, patterns]) => {
    const match = lowerHeaders.find((header) =>
      patterns.some((pattern) => header.includes(pattern))
    );
    if (match) {
      detectedColumns[key] = headers[lowerHeaders.indexOf(match)];
      return true;
    }
    return false;
  });

  // Try to detect WGS84 columns
  const wgs84Matches = Object.entries(wgs84Patterns).map(([key, patterns]) => {
    const match = lowerHeaders.find((header) =>
      patterns.some((pattern) => header.includes(pattern))
    );
    if (match) {
      detectedColumns[key] = headers[lowerHeaders.indexOf(match)];
      return true;
    }
    return false;
  });

  const utmScore = utmMatches.filter(Boolean).length;
  const wgs84Score = wgs84Matches.filter(Boolean).length;

  // Validate data to confirm detection
  if (utmScore >= 2 && isValidUTMData(data, detectedColumns)) {
    return {
      coordinateType: "UTM" as CoordinateType,
      detectedColumns,
    };
  }

  if (wgs84Score >= 2 && isValidWGS84Data(data, detectedColumns)) {
    return {
      coordinateType: "WGS84" as CoordinateType,
      detectedColumns,
    };
  }

  // If no clear detection, return without coordinate type
  return {
    detectedColumns:
      Object.keys(detectedColumns).length > 0 ? detectedColumns : undefined,
  };
};

/**
 * Validates if the data contains valid UTM coordinates
 * @param data - CSV data rows
 * @param columns - Detected column mappings
 * @returns True if data appears to be valid UTM
 */
const isValidUTMData = (data: CSVRow[], columns: any): boolean => {
  if (!columns.easting || !columns.northing) return false;

  // Check first few rows for valid UTM ranges
  const sampleSize = Math.min(5, data.length);

  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    const easting = parseFloat(row[columns.easting]);
    const northing = parseFloat(row[columns.northing]);

    if (isNaN(easting) || isNaN(northing)) return false;

    // Basic UTM range validation
    if (easting < 100000 || easting > 900000) return false;
    if (northing < 0 || northing > 10000000) return false;
  }

  return true;
};

/**
 * Validates if the data contains valid WGS84 coordinates
 * @param data - CSV data rows
 * @param columns - Detected column mappings
 * @returns True if data appears to be valid WGS84
 */
const isValidWGS84Data = (data: CSVRow[], columns: any): boolean => {
  if (!columns.latitude || !columns.longitude) return false;

  // Check first few rows for valid WGS84 ranges
  const sampleSize = Math.min(5, data.length);

  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    const lat = parseFloat(row[columns.latitude]);
    const lon = parseFloat(row[columns.longitude]);

    if (isNaN(lat) || isNaN(lon)) return false;

    // WGS84 range validation
    if (lat < -90 || lat > 90) return false;
    if (lon < -180 || lon > 180) return false;
  }

  return true;
};
