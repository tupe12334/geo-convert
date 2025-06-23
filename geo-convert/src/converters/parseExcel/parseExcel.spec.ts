import { describe, it, expect, vi } from "vitest";
import { parseExcel, getExcelWorksheets } from "./parseExcel";

// Mock XLSX library
vi.mock("xlsx", () => ({
  read: vi.fn(),
  utils: {
    sheet_to_csv: vi.fn(),
  },
}));

// Mock the parseCSV function
vi.mock("../parseCSV/parseCSV", () => ({
  parseCSV: vi.fn(),
}));

describe("parseExcel", () => {
  const mockFile = new File(["test"], "test.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  it("should parse Excel file and return result", async () => {
    const mockWorkbook = {
      SheetNames: ["Sheet1"],
      Sheets: {
        Sheet1: {},
      },
    };

    const mockCSVData = "header1,header2\nvalue1,value2";
    const mockParseResult = {
      data: [{ header1: "value1", header2: "value2" }],
      headers: ["header1", "header2"],
      coordinateType: "WGS84" as const,
      detectedColumns: { latitude: "header1", longitude: "header2" },
    };

    // Mock XLSX.read
    const XLSX = await import("xlsx");
    vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);
    vi.mocked(XLSX.utils.sheet_to_csv).mockReturnValue(mockCSVData);

    // Mock parseCSV
    const { parseCSV } = await import("../parseCSV/parseCSV");
    vi.mocked(parseCSV).mockReturnValue(mockParseResult);

    // Mock FileReader
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: new ArrayBuffer(8),
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader);

    const parsePromise = parseExcel(mockFile);

    // Trigger onload
    mockFileReader.onload({ target: { result: new ArrayBuffer(8) } });

    const result = await parsePromise;

    expect(result).toEqual({
      ...mockParseResult,
      worksheetName: "Sheet1",
    });
  });

  it("should handle file reading errors", async () => {
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(),
      onload: null as any,
      onerror: null as any,
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader);

    const parsePromise = parseExcel(mockFile);

    // Trigger onerror
    mockFileReader.onerror();

    await expect(parsePromise).rejects.toThrow("Failed to read Excel file");
  });
});

describe("getExcelWorksheets", () => {
  const mockFile = new File(["test"], "test.xlsx", {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  it("should return worksheet names", async () => {
    const mockWorkbook = {
      SheetNames: ["Sheet1", "Sheet2", "Data"],
      Sheets: {},
    };

    // Mock XLSX.read
    const XLSX = await import("xlsx");
    vi.mocked(XLSX.read).mockReturnValue(mockWorkbook as any);

    // Mock FileReader
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: new ArrayBuffer(8),
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader);

    const worksheetsPromise = getExcelWorksheets(mockFile);

    // Trigger onload
    mockFileReader.onload({ target: { result: new ArrayBuffer(8) } });

    const worksheets = await worksheetsPromise;

    expect(worksheets).toEqual(["Sheet1", "Sheet2", "Data"]);
  });
});
