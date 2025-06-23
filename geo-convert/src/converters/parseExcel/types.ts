import type { CSVParseResult } from "../parseCSV/types";

/**
 * Result of parsing an Excel file
 * This will be converted to CSV format internally
 */
export interface ExcelParseResult extends CSVParseResult {
  /** The name of the worksheet that was processed */
  worksheetName: string;
}

/**
 * Options for parsing Excel files
 */
export interface ExcelParseOptions {
  /** Specific worksheet to parse (default: first sheet) */
  sheetName?: string;
  /** Whether to include empty rows (default: false) */
  includeEmptyRows?: boolean;
}
