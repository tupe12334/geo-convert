export interface UTMCoordinate {
  easting: number;
  northing: number;
  zone: number;
  hemisphere: "N" | "S";
}

export interface WGS84Coordinate {
  latitude: number;
  longitude: number;
}

export interface ConversionRecord {
  id: string;
  timestamp: Date;
  type: "UTM_TO_WGS84" | "WGS84_TO_UTM";
  input: UTMCoordinate | WGS84Coordinate;
  output: WGS84Coordinate | UTMCoordinate;
  title?: string;
}

// Re-export CSV types
export type {
  CoordinateType,
  CSVParseResult,
  CSVRow,
  ManualColumnMapping,
} from "./parseCSV/types";

// Re-export Excel types
export type { ExcelParseResult, ExcelParseOptions } from "./parseExcel/types";
