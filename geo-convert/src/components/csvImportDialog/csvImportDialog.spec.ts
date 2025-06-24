import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { showCSVImportDialog } from "./csvImportDialog";
import type { CSVImportDialogOptions } from "./types";
import type { CSVParseResult } from "../../converters/types";

describe("csvImportDialog", () => {
  let mockOptions: CSVImportDialogOptions;
  let mockParseResult: CSVParseResult;

  beforeEach(() => {
    // Mock DOM
    document.body.innerHTML = "";

    mockParseResult = {
      data: [
        { lat: "40.7128", lng: "-74.0060", name: "New York" },
        { lat: "34.0522", lng: "-118.2437", name: "Los Angeles" },
      ],
      headers: ["lat", "lng", "name"],
      coordinateType: "WGS84",
      detectedColumns: {
        latitude: "lat",
        longitude: "lng",
      },
    };

    mockOptions = {
      parseResult: mockParseResult,
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      t: vi.fn((key: string) => key),
      showError: vi.fn(),
    };
  });

  afterEach(() => {
    // Clean up any remaining modals
    const modals = document.querySelectorAll(".csv-import-modal");
    modals.forEach((modal) => modal.remove());
  });

  describe("showCSVImportDialog", () => {
    it("should create and display a modal dialog", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const modal = document.querySelector(".csv-import-modal");
      expect(modal).toBeTruthy();
      expect(modal?.innerHTML).toContain("selectCoordinateType");

      // Cancel to close dialog
      const cancelBtn = modal?.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
      expect(mockOptions.onCancel).toHaveBeenCalled();
    });

    it("should show detected coordinate type when available", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const modal = document.querySelector(".csv-import-modal");
      expect(modal?.innerHTML).toContain("csvDetectedAs");
      expect(modal?.innerHTML).toContain("WGS84");

      // Cancel to close dialog
      const cancelBtn = modal?.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });

    it("should show column mappings when detected", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const modal = document.querySelector(".csv-import-modal");
      expect(modal?.innerHTML).toContain("csvColumnMapping");
      expect(modal?.innerHTML).toContain("latitude");
      expect(modal?.innerHTML).toContain("lat");

      // Cancel to close dialog
      const cancelBtn = modal?.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });

    it("should pre-select detected coordinate type", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const wgs84Radio = document.querySelector(
        'input[value="WGS84"]'
      ) as HTMLInputElement;
      expect(wgs84Radio?.checked).toBe(true);

      // Cancel to close dialog
      const cancelBtn = document.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });

    it("should display CSV preview with headers and data", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const modal = document.querySelector(".csv-import-modal");
      const table = modal?.querySelector("table");

      expect(table).toBeTruthy();
      expect(table?.innerHTML).toContain("lat");
      expect(table?.innerHTML).toContain("lng");
      expect(table?.innerHTML).toContain("40.7128");
      expect(table?.innerHTML).toContain("New York");

      // Cancel to close dialog
      const cancelBtn = modal?.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });

    it("should call onConfirm with selected coordinate type when confirmed", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const confirmBtn = document.querySelector(
        "#confirm-csv-import"
      ) as HTMLElement;
      confirmBtn?.click();

      await dialogPromise;
      expect(mockOptions.onConfirm).toHaveBeenCalledWith("WGS84", undefined);
    });

    it("should call onCancel when canceled", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const cancelBtn = document.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
      expect(mockOptions.onCancel).toHaveBeenCalled();
    });

    it("should close dialog when clicking outside", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      const modal = document.querySelector(".csv-import-modal") as HTMLElement;

      // Simulate outside click
      const clickEvent = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", { value: modal });
      modal.dispatchEvent(clickEvent);

      await dialogPromise;
      expect(mockOptions.onCancel).toHaveBeenCalled();
    });

    it("should show error when no coordinate type is selected", async () => {
      // Create parse result with no detected type
      const parseResultWithoutType = {
        ...mockParseResult,
        coordinateType: undefined,
      };

      const optionsWithoutType = {
        ...mockOptions,
        parseResult: parseResultWithoutType,
      };

      const dialogPromise = showCSVImportDialog(optionsWithoutType);

      // Try to confirm without selecting a type
      const confirmBtn = document.querySelector(
        "#confirm-csv-import"
      ) as HTMLElement;
      confirmBtn?.click();

      expect(mockOptions.showError).toHaveBeenCalledWith(
        "pleaseSelectCoordinateType"
      );

      // Cancel to close dialog
      const cancelBtn = document.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });
  });

  describe("manual column mapping", () => {
    it("should show manual mapping when switching coordinate types", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      // Switch to UTM (which requires manual mapping since original was WGS84)
      const utmRadio = document.querySelector(
        'input[value="UTM"]'
      ) as HTMLInputElement;
      utmRadio.click();

      const manualMapping = document.querySelector(
        "#manual-column-mapping"
      ) as HTMLElement;
      expect(manualMapping?.style.display).toBe("block");
      expect(manualMapping?.innerHTML).toContain("easting-column");
      expect(manualMapping?.innerHTML).toContain("northing-column");

      // Cancel to close dialog
      const cancelBtn = document.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });

    it("should validate required UTM columns", async () => {
      const dialogPromise = showCSVImportDialog(mockOptions);

      // Switch to UTM
      const utmRadio = document.querySelector(
        'input[value="UTM"]'
      ) as HTMLInputElement;
      utmRadio.click();

      // Try to confirm without mapping all columns
      const confirmBtn = document.querySelector(
        "#confirm-csv-import"
      ) as HTMLElement;
      confirmBtn?.click();

      expect(mockOptions.showError).toHaveBeenCalledWith(
        "columnMappingRequired"
      );

      // Cancel to close dialog
      const cancelBtn = document.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });

    it("should validate required WGS84 columns when manual mapping is needed", async () => {
      // Create parse result without detected columns
      const parseResultWithoutColumns = {
        ...mockParseResult,
        detectedColumns: undefined,
      };

      const optionsWithoutColumns = {
        ...mockOptions,
        parseResult: parseResultWithoutColumns,
      };

      const dialogPromise = showCSVImportDialog(optionsWithoutColumns);

      // WGS84 should be pre-selected but manual mapping should be shown
      const manualMapping = document.querySelector(
        "#manual-column-mapping"
      ) as HTMLElement;
      expect(manualMapping?.style.display).toBe("block");

      // Try to confirm without mapping columns
      const confirmBtn = document.querySelector(
        "#confirm-csv-import"
      ) as HTMLElement;
      confirmBtn?.click();

      expect(mockOptions.showError).toHaveBeenCalledWith(
        "columnMappingRequired"
      );

      // Cancel to close dialog
      const cancelBtn = document.querySelector(
        "#cancel-csv-import"
      ) as HTMLElement;
      cancelBtn?.click();

      await dialogPromise;
    });
  });
});
