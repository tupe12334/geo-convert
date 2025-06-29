import "./style.css";
import "notyf/notyf.min.css";
import {
  convertUTMtoWGS84,
  convertWGS84toUTM,
  parseUTMInputs,
  parseCSV,
  parseExcel,
} from "./converters";
import {
  createIcons,
  Pencil,
  Trash2,
  Upload,
  Info,
  Sheet,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Copy,
} from "lucide";
import { generateId } from "./utils/generateId";
import { initI18n, changeLanguage, t, getCurrentLanguage } from "./i18n";
import { createInfoButton } from "./components/infoButton";
import {
  // createDarkModeToggle,
  loadDarkModePreference,
} from "./components/darkModeToggle";
import { showCSVImportDialog } from "./components/csvImportDialog";
import { showBulkConversionDialog } from "./components/bulkConversionDialog";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import type {
  ConversionRecord,
  UTMCoordinate,
  WGS84Coordinate,
  CoordinateType,
  CSVParseResult,
  ManualColumnMapping,
} from "./converters/types";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="w-full h-full mx-auto p-4 sm:p-6 lg:p-8 text-center box-border overflow-y-auto text-white">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
        <img src="/assets/geo-convert-logo.svg" alt="Geo Convert Logo" width="40" height="40" class="sm:w-12 sm:h-12 flex-shrink-0">
        <h1 class="mb-0 flex-shrink-0 leading-none text-2xl sm:text-3xl lg:text-4xl text-white break-words" data-i18n="title">Geographic Coordinate Converter</h1>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0 h-[2.5rem] w-full sm:w-auto justify-center sm:justify-end">
        <select id="language-select" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm h-full min-w-[100px]">
          <option value="he">עברית</option>
          <option value="en">English</option>
          <option value="it">Italiano</option>
        </select>
        <div id="info-button-container" class="flex items-center gap-2"></div>
      </div>
    </div>
    <div class="bg-white/5 rounded-xl p-4 sm:p-6 lg:p-8 border border-white/10 w-full max-w-full box-border">
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-10 mb-2 w-full items-stretch">
        <div class="bg-white/[0.03] rounded-lg p-4 sm:p-6 border border-white/10 min-w-0 w-full box-border working-bench-section flex flex-col h-full order-1 xl:order-none">
          <h3 data-i18n="workingBench">Working Bench</h3>
          <div class="flex flex-col w-full mb-4">
            <label for="conversion-title" data-i18n="conversionTitle" class="block mb-2 text-white font-medium text-sm sm:text-base break-words">Conversion Title (optional):</label>
            <input 
              type="text" 
              id="conversion-title" 
              data-i18n-placeholder="conversionTitlePlaceholder"
              placeholder="הבית של פיסטוק"
              maxlength="100"
              class="text-sm sm:text-base"
            />
          </div>
          <div class="flex flex-col w-full flex-grow">
            <label for="working-notes" data-i18n="notesAndCalculations" class="block mb-2 text-white font-medium text-sm sm:text-base break-words">Notes & Calculations:</label>
            <textarea
              id="working-notes"
              data-i18n-placeholder="notesPlaceholder"
              placeholder="Use this area for notes, calculations, or temporary data storage. This field doesn't affect coordinate conversions."
              rows="4"
              class="flex-grow text-sm sm:text-base"
            ></textarea>
          </div>
          <div class="mt-4 space-y-2">
            <button id="bulk-convert-btn" class="import-csv-button w-full text-sm sm:text-base" data-i18n="bulkConvertCoordinates">
              <i data-lucide="check-circle"></i>
              Bulk Convert Coordinates
            </button>
            <button id="import-csv-btn" class="import-csv-button w-full text-sm sm:text-base" data-i18n="importCSV">
              <i data-lucide="upload"></i>
              Import CSV File
            </button>
            <input type="file" id="csv-file-input" accept=".csv" style="display: none;" />
            <button id="import-excel-btn" class="import-excel-button w-full text-sm sm:text-base" data-i18n="importExcel">
              <i data-lucide="sheet"></i>
              Import Excel File
            </button>
            <input type="file" id="excel-file-input" accept=".xlsx,.xls" style="display: none;" />
          </div>
        </div>
        
        <div class="bg-white/[0.03] rounded-lg p-4 sm:p-6 border border-white/10 min-w-0 w-full box-border utm-section flex flex-col h-full order-2 xl:order-none">
          <h3 data-i18n="utm">UTM Coordinates</h3>
          <p class="text-white/70 text-xs sm:text-sm mb-4" data-i18n="utmDescription">Enter UTM coordinates</p>
          <div class="grid grid-cols-1 gap-3 sm:gap-4 mb-6 flex-grow">
            <div class="flex flex-col w-full">
              <label for="easting-input" class="text-sm sm:text-base">Easting (X):</label>
              <input 
                type="number" 
                id="easting-input" 
                data-i18n-placeholder="eastingPlaceholder"
                placeholder="e.g., 500000"
                step="0.01"
                class="text-sm sm:text-base"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="northing-input" class="text-sm sm:text-base">Northing (Y):</label>
              <input 
                type="number" 
                id="northing-input" 
                data-i18n-placeholder="northingPlaceholder"
                placeholder="e.g., 4649776"
                step="0.01"
                class="text-sm sm:text-base"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="zone-input" data-i18n="zone" class="text-sm sm:text-base">Zone:</label>
              <input 
                type="number" 
                id="zone-input" 
                data-i18n-placeholder="zonePlaceholder"
                placeholder="1-60"
                min="1"
                max="60"
                class="text-sm sm:text-base"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="hemisphere-select" data-i18n="hemisphere" class="text-sm sm:text-base">Hemisphere:</label>
              <select id="hemisphere-select" class="text-sm sm:text-base">
                <option value="" data-i18n="select">Select</option>
                <option value="N" data-i18n-value="north">North (N)</option>
                <option value="S" data-i18n-value="south">South (S)</option>
              </select>
            </div>
          </div>
          <button id="convert-to-wgs84" data-i18n="convert" class="mt-auto text-sm sm:text-base py-3">Convert to WGS84 →</button>
          <div class="mt-4">
            <button id="copy-utm-btn" class="copy-button w-full text-sm sm:text-base py-2" data-i18n="copyUTM">
              <i data-lucide="copy"></i>
              Copy UTM Coordinates
            </button>
          </div>
        </div>
        
        <div class="bg-white/[0.03] rounded-lg p-4 sm:p-6 border border-white/10 min-w-0 w-full box-border wgs84-section flex flex-col h-full order-3 xl:order-none">
          <h3 data-i18n="wgs84">WGS84</h3>
          <p class="text-white/70 text-xs sm:text-sm mb-4" data-i18n="wgs84Description">Enter WGS84 coordinates</p>
          <div class="grid grid-cols-1 gap-3 sm:gap-4 mb-6">
            <div class="flex flex-col w-full">
              <label for="latitude-input" class="text-sm sm:text-base">Latitude:</label>
              <input 
                type="number" 
                id="latitude-input" 
                data-i18n-placeholder="latitudePlaceholder"
                placeholder="e.g., 41.123456"
                step="0.00000001"
                class="text-sm sm:text-base"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="longitude-input" class="text-sm sm:text-base">Longitude:</label>
              <input 
                type="number" 
                id="longitude-input" 
                data-i18n-placeholder="longitudePlaceholder"
                placeholder="e.g., 2.123456"
                step="0.00000001"
                class="text-sm sm:text-base"
              />
            </div>
          </div>
          <button id="convert-to-utm" data-i18n="convert" class="text-sm sm:text-base py-3">← Convert to UTM</button>
          <div class="mt-4">
            <button id="copy-wgs84-btn" class="copy-button w-full text-sm sm:text-base py-2" data-i18n="copyWGS84">
              <i data-lucide="copy"></i>
              Copy WGS84 Coordinates
            </button>
          </div>
        </div>

        <div class="bg-white/[0.03] rounded-lg p-4 sm:p-6 border border-white/10 min-w-0 w-full box-border history-section flex flex-col h-full order-4 xl:order-none lg:col-span-2 xl:col-span-1">
          <h3><span data-i18n="conversionHistory">Conversion History</span> (<span id="history-count">0</span>)</h3>
          <div class="flex flex-col sm:flex-row gap-2 mb-4 justify-center">
            <button id="clear-history" class="clear-button text-sm sm:text-base py-2" data-i18n="clearHistory">Clear History</button>
            <button id="export-history" class="export-button text-sm sm:text-base py-2" data-i18n="exportHistory">Export History</button>
          </div>
          <div class="relative flex-grow flex flex-col">
            <div id="history-list" class="flex-grow overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300 max-h-64 sm:max-h-96">
              <div class="history-empty" data-i18n="noConversionsYet">No conversions yet</div>
            </div>
            <div id="history-shadow" class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent pointer-events-none rounded-b-lg opacity-0 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Load dark mode preference before creating UI
loadDarkModePreference();

// Create and insert the info button
const infoButtonContainer = document.querySelector<HTMLDivElement>(
  "#info-button-container"
)!;
const infoButton = createInfoButton();
// const darkModeToggle = createDarkModeToggle();
// infoButtonContainer.appendChild(darkModeToggle);
infoButtonContainer.appendChild(infoButton);

// Initialize icons after DOM is ready
createIcons({
  icons: {
    Pencil,
    Trash2,
    Upload,
    Info,
    Sheet,
    CheckCircle,
    XCircle,
    Sun,
    Moon,
    Copy,
  },
});

// Initialize Notyf for toast notifications
const notyf = new Notyf({
  duration: 4000,
  position: {
    x: "right",
    y: "bottom",
  },
  types: [
    {
      type: "success",
    },
    {
      type: "error",
    },
  ],
});

// Initialize i18n
initI18n().then(() => {
  // Load language preference after i18n is initialized
  loadLanguagePreference();
});

// History management
let conversionHistory: ConversionRecord[] = [];

// Load history from localStorage
function loadHistory(): void {
  try {
    const saved = localStorage.getItem("geo-convert-history");
    if (saved) {
      const parsed = JSON.parse(saved);
      conversionHistory = parsed.map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp),
      }));
    }
  } catch (error) {
    console.warn("Failed to load history from localStorage:", error);
    conversionHistory = [];
  }
  updateHistoryDisplay();
}

// Save history to localStorage
function saveHistory(): void {
  try {
    localStorage.setItem(
      "geo-convert-history",
      JSON.stringify(conversionHistory)
    );
  } catch (error) {
    console.warn("Failed to save history to localStorage:", error);
  }
}

// Add new conversion to history
function addToHistory(
  type: "UTM_TO_WGS84" | "WGS84_TO_UTM",
  input: UTMCoordinate | WGS84Coordinate,
  output: WGS84Coordinate | UTMCoordinate,
  title?: string
): void {
  const record: ConversionRecord = {
    id: generateId(),
    timestamp: new Date(),
    type,
    input,
    output,
    title: title?.trim() || undefined,
  };

  conversionHistory.unshift(record); // Add to beginning of array

  // Keep only last 50 conversions
  if (conversionHistory.length > 50) {
    conversionHistory = conversionHistory.slice(0, 50);
  }

  saveHistory();
  updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay(): void {
  const historyList = document.querySelector<HTMLDivElement>("#history-list")!;
  const historyShadow =
    document.querySelector<HTMLDivElement>("#history-shadow")!;
  const historyCount =
    document.querySelector<HTMLSpanElement>("#history-count")!;

  historyCount.textContent = conversionHistory.length.toString();

  // Always use the same classes for the scrollable container
  historyList.className =
    "max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300";

  // Show/hide shadow based on content amount
  if (conversionHistory.length >= 3) {
    historyShadow.classList.remove("opacity-0");
    historyShadow.classList.add("opacity-100");
  } else {
    historyShadow.classList.remove("opacity-100");
    historyShadow.classList.add("opacity-0");
  }

  if (conversionHistory.length === 0) {
    historyList.innerHTML = `<div class="history-empty" data-i18n="noConversionsYet">${t(
      "noConversionsYet"
    )}</div>`;
    return;
  }

  historyList.innerHTML = conversionHistory
    .map((record) => {
      const currentLang = getCurrentLanguage();
      const locale =
        currentLang === "he"
          ? "he-IL"
          : currentLang === "it"
          ? "it-IT"
          : "en-US";
      const time = record.timestamp.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = record.timestamp.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
      const titleDisplay = record.title
        ? `<div class="history-title">${record.title}</div>`
        : "";

      if (record.type === "UTM_TO_WGS84") {
        const input = record.input as UTMCoordinate;
        const output = record.output as WGS84Coordinate;
        return `
          <div class="bg-white/[0.05] border border-white/10 rounded-md mb-3 p-2 sm:p-3 transition-colors duration-200 hover:bg-white/[0.08]" data-id="${
            record.id
          }">
            <div class="history-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
              <span class="font-semibold text-blue-400 text-xs sm:text-sm flex-shrink-0">UTM → WGS84</span>
              <div class="history-time text-xs text-white/70 text-left sm:text-right flex-shrink-0">
                <div class="sm:hidden">${date} ${time}</div>
                <div class="hidden sm:block">${date}</div>
                <div class="hidden sm:block">${time}</div>
              </div>
            </div>
            ${titleDisplay}
            <div class="history-actions grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3">
              <button class="history-edit-title text-xs sm:text-sm py-1 sm:py-2" data-id="${
                record.id
              }" title="Edit title"><i data-lucide="pencil"></i></button>
              <button class="history-delete text-xs sm:text-sm py-1 sm:py-2" data-id="${
                record.id
              }" title="Delete this conversion"><i data-lucide="trash-2"></i></button>
              <button class="history-load text-xs sm:text-sm py-1 sm:py-2" data-id="${
                record.id
              }">${t("load")}</button>
            </div>
            <div class="history-content text-xs sm:text-sm">
              <div class="history-input mb-1 break-words">
                <strong>UTM:</strong> ${input.easting.toFixed(
                  2
                )}, ${input.northing.toFixed(2)} 
                (Zone ${input.zone}${input.hemisphere})
              </div>
              <div class="history-output break-words">
                <strong>WGS84:</strong> ${output.latitude.toFixed(
                  8
                )}, ${output.longitude.toFixed(8)}
              </div>
            </div>
          </div>
        `;
      } else {
        const input = record.input as WGS84Coordinate;
        const output = record.output as UTMCoordinate;
        return `
          <div class="bg-white/[0.05] border border-white/10 rounded-md mb-3 p-2 sm:p-3 transition-colors duration-200 hover:bg-white/[0.08]" data-id="${
            record.id
          }">
            <div class="history-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1 sm:gap-0">
              <span class="font-semibold text-blue-400 text-xs sm:text-sm flex-shrink-0">WGS84 → UTM</span>
              <div class="history-time text-xs text-white/70 text-left sm:text-right flex-shrink-0">
                <div class="sm:hidden">${date} ${time}</div>
                <div class="hidden sm:block">${date}</div>
                <div class="hidden sm:block">${time}</div>
              </div>
            </div>
            ${titleDisplay}
            <div class="history-actions grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3">
              <button class="history-edit-title text-xs sm:text-sm py-1 sm:py-2" data-id="${
                record.id
              }" title="Edit title"><i data-lucide="pencil"></i></button>
              <button class="history-delete text-xs sm:text-sm py-1 sm:py-2" data-id="${
                record.id
              }" title="Delete this conversion"><i data-lucide="trash-2"></i></button>
              <button class="history-load text-xs sm:text-sm py-1 sm:py-2" data-id="${
                record.id
              }">${t("load")}</button>
            </div>
            <div class="history-content text-xs sm:text-sm">
              <div class="history-input mb-1 break-words">
                <strong>WGS84:</strong> ${input.latitude.toFixed(
                  8
                )}, ${input.longitude.toFixed(8)}
              </div>
              <div class="history-output break-words">
                <strong>UTM:</strong> ${output.easting.toFixed(
                  2
                )}, ${output.northing.toFixed(2)} 
                (Zone ${output.zone}${output.hemisphere})
              </div>
            </div>
          </div>
        `;
      }
    })
    .join("");

  // Add event listeners for load buttons
  historyList.querySelectorAll(".history-load").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id;
      if (id) loadFromHistory(id);
    });
  });

  // Add event listeners for edit title buttons
  historyList.querySelectorAll(".history-edit-title").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id;
      if (id) editHistoryTitle(id);
    });
  });

  // Add event listeners for delete buttons
  historyList.querySelectorAll(".history-delete").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = (e.target as HTMLButtonElement).dataset.id;
      if (id) deleteHistoryItem(id);
    });
  });
  createIcons({ icons: { Pencil, Trash2 } });
}

// Load conversion from history
function loadFromHistory(id: string): void {
  const record = conversionHistory.find((r) => r.id === id);
  if (!record) return;

  if (record.type === "UTM_TO_WGS84") {
    const input = record.input as UTMCoordinate;
    const output = record.output as WGS84Coordinate;

    eastingInput.value = input.easting.toString();
    northingInput.value = input.northing.toString();
    zoneInput.value = input.zone.toString();
    hemisphereSelect.value = input.hemisphere;
    latitudeInput.value = output.latitude.toFixed(8);
    longitudeInput.value = output.longitude.toFixed(8);
  } else {
    const input = record.input as WGS84Coordinate;
    const output = record.output as UTMCoordinate;

    latitudeInput.value = input.latitude.toFixed(8);
    longitudeInput.value = input.longitude.toFixed(8);
    eastingInput.value = output.easting.toString();
    northingInput.value = output.northing.toString();
    zoneInput.value = output.zone.toString();
    hemisphereSelect.value = output.hemisphere;
  }

  // Load title if it exists
  if (record.title) {
    conversionTitleInput.value = record.title;
  }

  notyf.success(`${t("loadedFromHistory")}`);
}

// Edit history title
function editHistoryTitle(id: string): void {
  const record = conversionHistory.find((r) => r.id === id);
  if (!record) return;

  const currentTitle = record.title || "";
  const newTitle = prompt("Enter title for this conversion:", currentTitle);

  if (newTitle !== null) {
    // User didn't cancel
    record.title = newTitle.trim() || undefined;
    saveHistory();
    updateHistoryDisplay();
    notyf.success(`${t("titleUpdated")}`);
  }
}

// Delete history item
function deleteHistoryItem(id: string): void {
  const record = conversionHistory.find((r) => r.id === id);
  if (!record) return;

  conversionHistory = conversionHistory.filter((r) => r.id !== id);
  saveHistory();
  updateHistoryDisplay();
  notyf.success(`${t("conversionDeleted")}`);
}

// Clear history
function clearHistory(): void {
  if (confirm(t("clearHistoryConfirm"))) {
    conversionHistory = [];
    saveHistory();
    updateHistoryDisplay();
    notyf.success(`${t("historyCleared")}`);
  }
}

// Export history
function exportHistory(): void {
  if (conversionHistory.length === 0) {
    notyf.error(t("noHistoryToExport"));
    return;
  }

  const data = conversionHistory.map((record) => ({
    timestamp: record.timestamp.toISOString(),
    type: record.type,
    input: record.input,
    output: record.output,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `geo-convert-history-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  notyf.success(`${t("historyExported")}`);
}

// Bulk Conversion functionality
function showBulkConversionDialogHandler(): void {
  showBulkConversionDialog({
    onConfirm: (results: any[]) => {
      // Add all conversion results to history
      let addedCount = 0;
      for (const result of results) {
        try {
          addToHistory(result.type, result.input, result.output, result.title);
          addedCount++;
        } catch (error) {
          console.error("Failed to add conversion to history:", error);
        }
      }

      if (addedCount > 0) {
        notyf.success(
          t("bulkConversionsAddedToHistory", { count: addedCount })
        );
      }
    },
    onCancel: () => {
      // Dialog cancelled, no action needed
    },
    t,
    showError: (message: string) => notyf.error(message),
    showSuccess: (message: string) => notyf.success(message),
  });
}

// CSV Import functionality
function importCSVFile(): void {
  const csvFileInput =
    document.querySelector<HTMLInputElement>("#csv-file-input")!;
  csvFileInput.click();
}

function handleCSVFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    notyf.error(t("pleaseSelectCSVFile"));
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csvText = e.target?.result as string;
      const parseResult = parseCSV(csvText);

      if (parseResult.data.length === 0) {
        notyf.error(t("noValidData"));
        return;
      }

      showCSVImportDialog({
        parseResult,
        onConfirm: (
          coordinateType: CoordinateType,
          columnMapping?: ManualColumnMapping
        ) => {
          const conversionTitle = conversionTitleInput.value.trim();
          processCSVData(
            parseResult,
            coordinateType,
            columnMapping,
            conversionTitle
          );
        },
        onCancel: () => {
          // Dialog is automatically closed
        },
        t,
        showError: (message: string) => notyf.error(message),
      });
    } catch (error) {
      console.error("CSV parsing error:", error);
      notyf.error(t("csvError"));
    }
  };

  reader.readAsText(file);

  // Reset the input value to allow selecting the same file again
  target.value = "";
}

function processCSVData(
  parseResult: CSVParseResult,
  coordinateType: CoordinateType,
  manualColumnMapping?: ManualColumnMapping,
  conversionTitle?: string
): void {
  let convertedCount = 0;
  const errors: string[] = [];
  const convertedData: any[] = [];

  // Use manual column mapping if provided, otherwise use detected columns
  const columnMapping = manualColumnMapping || parseResult.detectedColumns;

  for (const [index, row] of parseResult.data.entries()) {
    try {
      if (coordinateType === "UTM") {
        // Convert UTM to WGS84
        const utm = extractUTMFromRow(row, columnMapping);
        if (utm) {
          const wgs84 = convertUTMtoWGS84(utm);
          addToHistory("UTM_TO_WGS84", utm, wgs84, `CSV Row ${index + 1}`);

          // Collect converted data for download
          convertedData.push({
            ...row,
            converted_latitude: wgs84.latitude.toFixed(8),
            converted_longitude: wgs84.longitude.toFixed(8),
          });
          convertedCount++;
        }
      } else {
        // Convert WGS84 to UTM
        const wgs84 = extractWGS84FromRow(row, columnMapping);
        if (wgs84) {
          const utm = convertWGS84toUTM(wgs84);
          addToHistory("WGS84_TO_UTM", wgs84, utm, `CSV Row ${index + 1}`);

          // Collect converted data for download
          convertedData.push({
            ...row,
            converted_easting: utm.easting.toFixed(2),
            converted_northing: utm.northing.toFixed(2),
            converted_zone: utm.zone.toString(),
            converted_hemisphere: utm.hemisphere,
          });
          convertedCount++;
        }
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error}`);
    }
  }

  if (convertedCount > 0) {
    const message = t("csvProcessed", { count: convertedCount });
    notyf.success(`${message}`);

    // Offer to download converted data
    offerCSVDownload(
      convertedData,
      coordinateType,
      parseResult.headers,
      conversionTitle
    );
  }

  if (errors.length > 0) {
    console.warn("CSV import errors:", errors);
    if (convertedCount === 0) {
      notyf.error(t("noValidData"));
    }
  }
}

/**
 * Offers to download the converted CSV data
 * @param convertedData - Array of converted data rows
 * @param coordinateType - The original coordinate type that was converted
 * @param originalHeaders - The original CSV headers
 * @param conversionTitle - Optional conversion title to use in filename
 */
function offerCSVDownload(
  convertedData: any[],
  coordinateType: CoordinateType,
  originalHeaders: string[],
  conversionTitle?: string
): void {
  const modal = document.createElement("div");
  modal.className = "csv-download-modal";

  const targetType = coordinateType === "UTM" ? "WGS84" : "UTM";

  modal.innerHTML = `
    <div class="csv-download-dialog max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 dark:scrollbar-track-gray-700 scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-300 mx-4 sm:mx-0">
      <h3 class="text-lg sm:text-xl">${t("downloadConvertedCSV")}</h3>
      <p class="text-sm sm:text-base">${t("csvConvertedMessage", {
        from: coordinateType,
        to: targetType,
      })}</p>
      
      <div class="dialog-actions flex-col sm:flex-row gap-2 sm:gap-4">
        <button id="cancel-csv-download" class="cancel-button w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3">${t(
          "cancel"
        )}</button>
        <button id="confirm-csv-download" class="confirm-button w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3">${t(
          "downloadConvertedCSV"
        )}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  const cancelBtn = modal.querySelector("#cancel-csv-download")!;
  const confirmBtn = modal.querySelector("#confirm-csv-download")!;

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  confirmBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
    downloadConvertedCSV(
      convertedData,
      coordinateType,
      originalHeaders,
      conversionTitle
    );
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

/**
 * Downloads the converted CSV data as a file
 * @param convertedData - Array of converted data rows
 * @param coordinateType - The original coordinate type that was converted
 * @param originalHeaders - The original CSV headers
 * @param conversionTitle - Optional conversion title to use in filename
 */
function downloadConvertedCSV(
  convertedData: any[],
  coordinateType: CoordinateType,
  originalHeaders: string[],
  conversionTitle?: string
): void {
  const targetType = coordinateType === "UTM" ? "WGS84" : "UTM";

  // Determine new headers based on conversion type
  const newHeaders =
    coordinateType === "UTM"
      ? [...originalHeaders, "converted_latitude", "converted_longitude"]
      : [
          ...originalHeaders,
          "converted_easting",
          "converted_northing",
          "converted_zone",
          "converted_hemisphere",
        ];

  // Generate CSV content
  const csvContent = generateCSVContent(convertedData, newHeaders);

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Use conversion title if provided, otherwise use default naming
  let filename: string;
  if (conversionTitle) {
    // Sanitize the title for filename use (remove/replace invalid characters)
    const sanitizedTitle = conversionTitle
      .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid filename characters
      .trim();
    filename = `${sanitizedTitle}.csv`;
  } else {
    filename = `converted_${coordinateType}_to_${targetType}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  notyf.success(`${t("csvDownloaded")}`);
}

/**
 * Generates CSV content from data array and headers
 * @param data - Array of data objects
 * @param headers - Array of header names
 * @returns CSV content as string
 */
function generateCSVContent(data: any[], headers: string[]): string {
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.map(escapeCSVValue).join(","));

  // Add data rows
  for (const row of data) {
    const csvRow = headers
      .map((header) => escapeCSVValue(row[header] || ""))
      .join(",");
    csvRows.push(csvRow);
  }

  return csvRows.join("\n");
}

/**
 * Escapes a value for CSV format
 * @param value - The value to escape
 * @returns Escaped CSV value
 */
function escapeCSVValue(value: string): string {
  const stringValue = String(value);

  // If the value contains comma, newline, or quote, wrap it in quotes and escape internal quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function extractUTMFromRow(
  row: any,
  detectedColumns: any
): UTMCoordinate | null {
  if (!detectedColumns) return null;

  const easting = parseFloat(row[detectedColumns.easting || ""]);
  const northing = parseFloat(row[detectedColumns.northing || ""]);
  const zone = parseInt(row[detectedColumns.zone || ""], 10);
  const hemisphere = row[detectedColumns.hemisphere || ""] as "N" | "S";

  if (isNaN(easting) || isNaN(northing) || isNaN(zone) || !hemisphere) {
    return null;
  }

  return { easting, northing, zone, hemisphere };
}

function extractWGS84FromRow(
  row: any,
  detectedColumns: any
): WGS84Coordinate | null {
  if (!detectedColumns) return null;

  const latitude = parseFloat(row[detectedColumns.latitude || ""]);
  const longitude = parseFloat(row[detectedColumns.longitude || ""]);

  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
// Set up event listeners
const conversionTitleInput =
  document.querySelector<HTMLInputElement>("#conversion-title")!;
const eastingInput =
  document.querySelector<HTMLInputElement>("#easting-input")!;
const northingInput =
  document.querySelector<HTMLInputElement>("#northing-input")!;
const zoneInput = document.querySelector<HTMLInputElement>("#zone-input")!;
const hemisphereSelect =
  document.querySelector<HTMLSelectElement>("#hemisphere-select")!;
const latitudeInput =
  document.querySelector<HTMLInputElement>("#latitude-input")!;
const longitudeInput =
  document.querySelector<HTMLInputElement>("#longitude-input")!;
const convertToWGS84Btn =
  document.querySelector<HTMLButtonElement>("#convert-to-wgs84")!;
const convertToUTMBtn =
  document.querySelector<HTMLButtonElement>("#convert-to-utm")!;
const clearHistoryBtn =
  document.querySelector<HTMLButtonElement>("#clear-history")!;
const exportHistoryBtn =
  document.querySelector<HTMLButtonElement>("#export-history")!;
const bulkConvertBtn =
  document.querySelector<HTMLButtonElement>("#bulk-convert-btn")!;
const importCSVBtn =
  document.querySelector<HTMLButtonElement>("#import-csv-btn")!;
const csvFileInput =
  document.querySelector<HTMLInputElement>("#csv-file-input")!;
const importExcelBtn =
  document.querySelector<HTMLButtonElement>("#import-excel-btn")!;
const excelFileInput =
  document.querySelector<HTMLInputElement>("#excel-file-input")!;
const copyUTMBtn = document.querySelector<HTMLButtonElement>("#copy-utm-btn")!;
const copyWGS84Btn =
  document.querySelector<HTMLButtonElement>("#copy-wgs84-btn")!;

// Initialize history on page load
loadHistory();

function convertUTMToWGS84() {
  const eastingValue = eastingInput.value.trim();
  const northingValue = northingInput.value.trim();
  const zoneValue = zoneInput.value.trim();
  const hemisphereValue = hemisphereSelect.value;

  if (!eastingValue || !northingValue || !zoneValue || !hemisphereValue) {
    notyf.error(t("invalidInput"));
    return;
  }

  const utm = parseUTMInputs(
    eastingValue,
    northingValue,
    zoneValue,
    hemisphereValue
  );

  if (!utm) {
    notyf.error(t("invalidInput"));
    return;
  }

  try {
    const wgs84 = convertUTMtoWGS84(utm);
    latitudeInput.value = wgs84.latitude.toFixed(8);
    longitudeInput.value = wgs84.longitude.toFixed(8);
    notyf.success(`${t("convertedUTMToWGS84")}`);

    // Add to history
    const title = conversionTitleInput.value.trim();
    addToHistory("UTM_TO_WGS84", utm, wgs84, title);

    // Clear title input after successful conversion
    conversionTitleInput.value = "";
  } catch (error) {
    notyf.error(t("conversionError"));
  }
}

function convertWGS84ToUTM() {
  const latitudeValue = latitudeInput.value.trim();
  const longitudeValue = longitudeInput.value.trim();

  if (!latitudeValue || !longitudeValue) {
    notyf.error(t("invalidInput"));
    return;
  }

  const latitude = parseFloat(latitudeValue);
  const longitude = parseFloat(longitudeValue);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    notyf.error(t("invalidInput"));
    return;
  }

  try {
    const utm = convertWGS84toUTM({ latitude, longitude });
    eastingInput.value = utm.easting.toFixed(2);
    northingInput.value = utm.northing.toFixed(2);
    zoneInput.value = utm.zone.toString();
    hemisphereSelect.value = utm.hemisphere;
    notyf.success(`${t("convertedWGS84ToUTM")}`);

    // Add to history
    const title = conversionTitleInput.value.trim();
    addToHistory("WGS84_TO_UTM", { latitude, longitude }, utm, title);

    // Clear title input after successful conversion
    conversionTitleInput.value = "";
  } catch (error) {
    notyf.error(t("conversionError"));
  }
}

// Copy coordinate functions
function copyUTMCoordinates(): void {
  const eastingValue = eastingInput.value.trim();
  const northingValue = northingInput.value.trim();
  const zoneValue = zoneInput.value.trim();
  const hemisphereValue = hemisphereSelect.value;

  if (!eastingValue || !northingValue || !zoneValue || !hemisphereValue) {
    notyf.error(t("noCoordinatesToCopy"));
    return;
  }

  const utm = parseUTMInputs(
    eastingValue,
    northingValue,
    zoneValue,
    hemisphereValue
  );

  if (!utm) {
    notyf.error(t("invalidCoordinatesToCopy"));
    return;
  }

  const coordinateString = `${utm.easting.toFixed(2)}, ${utm.northing.toFixed(
    2
  )} (Zone ${utm.zone}${utm.hemisphere})`;

  navigator.clipboard
    .writeText(coordinateString)
    .then(() => {
      notyf.success(t("utmCoordinatesCopied"));
    })
    .catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = coordinateString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      notyf.success(t("utmCoordinatesCopied"));
    });
}

function copyWGS84Coordinates(): void {
  const latitudeValue = latitudeInput.value.trim();
  const longitudeValue = longitudeInput.value.trim();

  if (!latitudeValue || !longitudeValue) {
    notyf.error(t("noCoordinatesToCopy"));
    return;
  }

  const latitude = parseFloat(latitudeValue);
  const longitude = parseFloat(longitudeValue);

  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    notyf.error(t("invalidCoordinatesToCopy"));
    return;
  }

  const coordinateString = `${latitude.toFixed(8)}, ${longitude.toFixed(8)}`;

  navigator.clipboard
    .writeText(coordinateString)
    .then(() => {
      notyf.success(t("wgs84CoordinatesCopied"));
    })
    .catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = coordinateString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      notyf.success(t("wgs84CoordinatesCopied"));
    });
}

// Event listeners
convertToWGS84Btn.addEventListener("click", convertUTMToWGS84);
convertToUTMBtn.addEventListener("click", convertWGS84ToUTM);
copyUTMBtn.addEventListener("click", copyUTMCoordinates);
copyWGS84Btn.addEventListener("click", copyWGS84Coordinates);
clearHistoryBtn.addEventListener("click", clearHistory);
exportHistoryBtn.addEventListener("click", exportHistory);
bulkConvertBtn.addEventListener("click", showBulkConversionDialogHandler);
importCSVBtn.addEventListener("click", importCSVFile);
csvFileInput.addEventListener("change", handleCSVFileSelect);
importExcelBtn.addEventListener("click", importExcelFile);
excelFileInput.addEventListener("change", handleExcelFileSelect);
copyUTMBtn.addEventListener("click", copyUTMCoordinates);
copyWGS84Btn.addEventListener("click", copyWGS84Coordinates);

// Add Enter key support for UTM inputs
const utmInputs = [eastingInput, northingInput, zoneInput];
utmInputs.forEach((input: HTMLInputElement) => {
  input.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      convertUTMToWGS84();
    }
  });
});

// Add Enter key support for WGS84 inputs
const wgs84Inputs = [latitudeInput, longitudeInput];
wgs84Inputs.forEach((input: HTMLInputElement) => {
  input.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      convertWGS84ToUTM();
    }
  });
});

hemisphereSelect.addEventListener("change", () => {
  // Auto-convert when hemisphere is selected if other UTM fields are filled
  if (
    eastingInput.value &&
    northingInput.value &&
    zoneInput.value &&
    hemisphereSelect.value
  ) {
    convertUTMToWGS84();
  }
});

// Language select functionality
const languageSelect =
  document.querySelector<HTMLSelectElement>("#language-select")!;

// Load saved language preference
function loadLanguagePreference(): void {
  try {
    const savedLanguage = localStorage.getItem("geo-convert-language");
    if (
      savedLanguage &&
      (savedLanguage === "he" ||
        savedLanguage === "en" ||
        savedLanguage === "it")
    ) {
      languageSelect.value = savedLanguage;
      changeLanguage(savedLanguage);
    } else {
      // Default to Hebrew if no preference saved
      languageSelect.value = "he";
      changeLanguage("he");
    }
    // Update history display with the correct locale
    updateHistoryDisplay();
  } catch (error) {
    console.warn("Failed to load language preference:", error);
    languageSelect.value = "he";
    changeLanguage("he");
    updateHistoryDisplay();
  }
}

// Save language preference
function saveLanguagePreference(language: string): void {
  try {
    localStorage.setItem("geo-convert-language", language);
  } catch (error) {
    console.warn("Failed to save language preference:", error);
  }
}

// Handle language change
languageSelect.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const selectedLanguage = target.value;

  saveLanguagePreference(selectedLanguage);
  changeLanguage(selectedLanguage);
  updateHistoryDisplay(); // Update history with new locale

  const languageName = target.options[target.selectedIndex].text;
  notyf.success(`${t("result")}: ${languageName}`);
});

// Excel Import functionality
function importExcelFile(): void {
  const excelFileInput =
    document.querySelector<HTMLInputElement>("#excel-file-input")!;
  excelFileInput.click();
}

function handleExcelFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
    notyf.error(t("pleaseSelectExcelFile"));
    return;
  }

  // Show loading notification
  notyf.success(t("processingExcelFile"));

  parseExcel(file)
    .then((parseResult) => {
      if (parseResult.data.length === 0) {
        notyf.error(t("noValidData"));
        return;
      }

      // Use the same dialog as CSV since the result structure is compatible
      showCSVImportDialog({
        parseResult,
        onConfirm: (
          coordinateType: CoordinateType,
          columnMapping?: ManualColumnMapping
        ) => {
          const conversionTitle = conversionTitleInput.value.trim();
          processCSVData(
            parseResult,
            coordinateType,
            columnMapping,
            conversionTitle
          );
        },
        onCancel: () => {
          // Dialog is automatically closed
        },
        t,
        showError: (message: string) => notyf.error(message),
      });
    })
    .catch((error) => {
      console.error("Excel parsing error:", error);
      notyf.error(t("excelError"));
    });

  // Reset the input value to allow selecting the same file again
  target.value = "";
}
