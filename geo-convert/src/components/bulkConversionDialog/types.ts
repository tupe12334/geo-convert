import type { CoordinateType } from "../../converters/types";

/**
 * Configuration options for the bulk conversion dialog
 */
export interface BulkConversionDialogOptions {
  /** Callback when user confirms the bulk conversion */
  onConfirm: (results: any[]) => void;
  /** Callback when user cancels the bulk conversion */
  onCancel: () => void;
  /** Translation function */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** Notification function for errors */
  showError: (message: string) => void;
  /** Notification function for success messages */
  showSuccess: (message: string) => void;
}

/**
 * Internal state for the bulk conversion dialog
 */
export interface BulkConversionDialogState {
  /** The coordinate type being converted */
  coordinateType: CoordinateType;
  /** Array of coordinate entries */
  entries: BulkCoordinateEntry[];
  /** Conversion results */
  results: any[];
}

/**
 * Represents a single coordinate entry in the bulk conversion
 */
export interface BulkCoordinateEntry {
  /** Unique identifier for the entry */
  id: string;
  /** Optional title for the entry */
  title: string;
  /** Coordinate values */
  coordinates: BulkCoordinateValues;
}

/**
 * Coordinate values that can be entered for bulk conversion
 */
export interface BulkCoordinateValues {
  // WGS84 coordinates
  latitude?: number;
  longitude?: number;
  // UTM coordinates
  easting?: number;
  northing?: number;
  zone?: number;
  hemisphere?: "N" | "S";
}
