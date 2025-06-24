import type {
  CSVParseResult,
  CoordinateType,
  ManualColumnMapping,
} from "../../converters/types";

/**
 * Configuration options for the CSV import dialog
 */
export interface CSVImportDialogOptions {
  /** The parsed CSV data to display */
  parseResult: CSVParseResult;
  /** Callback when user confirms import */
  onConfirm: (
    coordinateType: CoordinateType,
    columnMapping?: ManualColumnMapping
  ) => void;
  /** Callback when user cancels import */
  onCancel: () => void;
  /** Translation function */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** Notification function for errors */
  showError: (message: string) => void;
}

/**
 * Internal state for the CSV import dialog
 */
export interface CSVImportDialogState {
  /** The currently selected coordinate type */
  selectedCoordinateType?: CoordinateType;
  /** Whether manual column mapping is currently shown */
  isManualMappingVisible: boolean;
  /** Current manual column mappings */
  manualMapping: Partial<ManualColumnMapping>;
}
