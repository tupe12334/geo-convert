export type CoordinateType = "UTM" | "WGS84";

export interface CSVRow {
  [key: string]: string;
}

export interface CSVParseResult {
  data: CSVRow[];
  headers: string[];
  coordinateType?: CoordinateType;
  detectedColumns?: {
    // For UTM
    easting?: string;
    northing?: string;
    zone?: string;
    hemisphere?: string;
    // For WGS84
    latitude?: string;
    longitude?: string;
  };
}
