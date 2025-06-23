import * as XLSX from 'xlsx';
import { parseCSV } from '../parseCSV/parseCSV';
import type { ExcelParseResult, ExcelParseOptions } from './types';

/**
 * Parses an Excel file and converts it to CSV format for further processing
 * @param file - The Excel file to parse
 * @param options - Optional parsing configuration
 * @returns Promise that resolves to parsed Excel data in CSV format
 */
export const parseExcel = async (
  file: File,
  options: ExcelParseOptions = {}
): Promise<ExcelParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the target worksheet
        const sheetName = options.sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          throw new Error(`Worksheet "${sheetName}" not found`);
        }
        
        // Convert worksheet to CSV format
        const csvData = XLSX.utils.sheet_to_csv(worksheet, {
          skipHidden: true,
          blankrows: options.includeEmptyRows || false
        });
        
        if (!csvData.trim()) {
          throw new Error('Excel file appears to be empty or contains no data');
        }
        
        // Use the existing CSV parser to process the converted data
        const parseResult = parseCSV(csvData);
        
        // Return the result with Excel-specific metadata
        const result: ExcelParseResult = {
          ...parseResult,
          worksheetName: sheetName
        };
        
        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Gets the list of worksheet names from an Excel file
 * @param file - The Excel file to analyze
 * @returns Promise that resolves to array of worksheet names
 */
export const getExcelWorksheets = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to read Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
