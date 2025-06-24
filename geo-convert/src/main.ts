import "./style.css";
import {
  convertUTMtoWGS84,
  convertWGS84toUTM,
  parseUTMInputs,
  parseCSV,
  parseExcel,
} from "./converters";
import { createIcons, Pencil, Trash2, Upload, Info, Sheet } from "lucide";
import { generateId } from "./utils/generateId";
import { initI18n, changeLanguage, t, getCurrentLanguage } from "./i18n";
import { createInfoButton } from "./components/infoButton";
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
  <div class="w-full h-full mx-auto p-8 text-center box-border overflow-y-auto">
    <div class="flex flex-wrap sm:flex-nowrap justify-between items-center mb-8 gap-4">
      <h1 class="mb-0 flex-shrink-0 leading-none text-4xl text-white" data-i18n="title">Geographic Coordinate Converter</h1>
      <div class="flex items-center gap-2 flex-shrink-0 h-[2.5rem]">
        <select id="language-select" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm h-full">
          <option value="he">עברית</option>
          <option value="en">English</option>
          <option value="it">Italiano</option>
        </select>
        <div id="info-button-container"></div>
      </div>
    </div>
    <div class="bg-white/5 rounded-xl p-8 border border-white/10 w-full max-w-full box-border">
      <div class="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] xl:grid-cols-4 gap-4 md:gap-6 xl:gap-10 mb-2 w-full">
        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border working-bench-section">
          <h3 data-i18n="workingBench">Working Bench</h3>
          <div class="flex flex-col w-full mb-4">
            <label for="conversion-title" data-i18n="conversionTitle" class="block mb-2 text-white font-medium text-base break-words">Conversion Title (optional):</label>
            <input 
              type="text" 
              id="conversion-title" 
              data-i18n-placeholder="conversionTitlePlaceholder"
              placeholder="הבית של פיסטוק"
              maxlength="100"
            />
          </div>
          <div class="flex flex-col w-full">
            <label for="working-notes" data-i18n="notesAndCalculations" class="block mb-2 text-white font-medium text-base break-words">Notes & Calculations:</label>
            <textarea
              id="working-notes"
              data-i18n-placeholder="notesPlaceholder"
              placeholder="Use this area for notes, calculations, or temporary data storage. This field doesn't affect coordinate conversions."
              rows="6"
            ></textarea>
          </div>
          <div class="mt-4 space-y-2">
            <button id="import-csv-btn" class="import-csv-button w-full" data-i18n="importCSV">
              <i data-lucide="upload"></i>
              Import CSV File
            </button>
            <input type="file" id="csv-file-input" accept=".csv" style="display: none;" />
            <button id="import-excel-btn" class="import-excel-button w-full" data-i18n="importExcel">
              <i data-lucide="sheet"></i>
              Import Excel File
            </button>
            <input type="file" id="excel-file-input" accept=".xlsx,.xls" style="display: none;" />
          </div>
        </div>
        
        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border utm-section">
          <h3 data-i18n="utm">UTM Coordinates</h3>
          <p class="text-white/70 text-sm mb-4" data-i18n="utmDescription">Enter UTM coordinates</p>
          <div class="grid grid-cols-1 gap-4 mb-6">
            <div class="flex flex-col w-full">
              <label for="easting-input">Easting (X):</label>
              <input 
                type="number" 
                id="easting-input" 
                data-i18n-placeholder="eastingPlaceholder"
                placeholder="e.g., 500000"
                step="0.01"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="northing-input">Northing (Y):</label>
              <input 
                type="number" 
                id="northing-input" 
                data-i18n-placeholder="northingPlaceholder"
                placeholder="e.g., 4649776"
                step="0.01"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="zone-input" data-i18n="zone">Zone:</label>
              <input 
                type="number" 
                id="zone-input" 
                data-i18n-placeholder="zonePlaceholder"
                placeholder="1-60"
                min="1"
                max="60"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="hemisphere-select">Hemisphere:</label>
              <select id="hemisphere-select">
                <option value="" data-i18n="select">Select</option>
                <option value="N" data-i18n-value="north">North (N)</option>
                <option value="S" data-i18n-value="south">South (S)</option>
              </select>
            </div>
          </div>
          <button id="convert-to-wgs84" data-i18n="convert">Convert to WGS84 →</button>
        </div>
        
        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border wgs84-section">
          <h3 data-i18n="wgs84">WGS84</h3>
          <p class="text-white/70 text-sm mb-4" data-i18n="wgs84Description">Enter WGS84 coordinates</p>
          <div class="grid grid-cols-1 gap-4 mb-6">
            <div class="flex flex-col w-full">
              <label for="latitude-input">Latitude:</label>
              <input 
                type="number" 
                id="latitude-input" 
                data-i18n-placeholder="latitudePlaceholder"
                placeholder="e.g., 41.123456"
                step="0.00000001"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="longitude-input">Longitude:</label>
              <input 
                type="number" 
                id="longitude-input" 
                data-i18n-placeholder="longitudePlaceholder"
                placeholder="e.g., 2.123456"
                step="0.00000001"
              />
            </div>
          </div>
          <button id="convert-to-utm" data-i18n="convert">← Convert to UTM</button>
        </div>

        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border history-section">
          <h3><span data-i18n="conversionHistory">Conversion History</span> (<span id="history-count">0</span>)</h3>
          <div class="flex gap-2 mb-4 justify-center">
            <button id="clear-history" class="clear-button" data-i18n="clearHistory">Clear History</button>
            <button id="export-history" class="export-button" data-i18n="exportHistory">Export History</button>
          </div>
          <div id="history-list" class="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30">
            <div class="history-empty" data-i18n="noConversionsYet">No conversions yet</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Create and insert the info button
const infoButtonContainer = document.querySelector<HTMLDivElement>(
  "#info-button-container"
)!;
const infoButton = createInfoButton();
infoButtonContainer.appendChild(infoButton);

createIcons({ icons: { Pencil, Trash2, Upload, Info, Sheet } });

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
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      icon: {
        className: "notyf__icon--success",
        tagName: "i",
      },
    },
    {
      type: "error",
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      icon: {
        className: "notyf__icon--error",
        tagName: "i",
      },
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
  const historyCount =
    document.querySelector<HTMLSpanElement>("#history-count")!;

  historyCount.textContent = conversionHistory.length.toString();

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
      const time = record.timestamp.toLocaleTimeString(locale);
      const date = record.timestamp.toLocaleDateString(locale);
      const titleDisplay = record.title
        ? `<div class="history-title">${record.title}</div>`
        : "";

      if (record.type === "UTM_TO_WGS84") {
        const input = record.input as UTMCoordinate;
        const output = record.output as WGS84Coordinate;
        return `
          <div class="bg-white/[0.05] border border-white/10 rounded-md mb-3 p-3 transition-colors duration-200 hover:bg-white/[0.08]" data-id="${
            record.id
          }">
            <div class="history-header">
              <span class="history-type">UTM → WGS84</span>
              <span class="history-time">${date} ${time}</span>
            </div>
            ${titleDisplay}
            <div class="history-actions">
              <button class="history-edit-title" data-id="${
                record.id
              }" title="Edit title"><i data-lucide="pencil"></i></button>
              <button class="history-delete" data-id="${
                record.id
              }" title="Delete this conversion"><i data-lucide="trash-2"></i></button>
              <button class="history-load" data-id="${record.id}">${t(
          "load"
        )}</button>
            </div>
            <div class="history-content">
              <div class="history-input">
                <strong>UTM:</strong> ${input.easting.toFixed(
                  2
                )}, ${input.northing.toFixed(2)} 
                (Zone ${input.zone}${input.hemisphere})
              </div>
              <div class="history-output">
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
          <div class="bg-white/[0.05] border border-white/10 rounded-md mb-3 p-3 transition-colors duration-200 hover:bg-white/[0.08]" data-id="${
            record.id
          }">
            <div class="history-header">
              <span class="history-type">WGS84 → UTM</span>
              <span class="history-time">${date} ${time}</span>
            </div>
            ${titleDisplay}
            <div class="history-actions">
              <button class="history-edit-title" data-id="${
                record.id
              }" title="Edit title"><i data-lucide="pencil"></i></button>
              <button class="history-delete" data-id="${
                record.id
              }" title="Delete this conversion"><i data-lucide="trash-2"></i></button>
              <button class="history-load" data-id="${record.id}">${t(
          "load"
        )}</button>
            </div>
            <div class="history-content">
              <div class="history-input">
                <strong>WGS84:</strong> ${input.latitude.toFixed(
                  8
                )}, ${input.longitude.toFixed(8)}
              </div>
              <div class="history-output">
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

  notyf.success(`✓ ${t("loadedFromHistory")}`);
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
    notyf.success(`✓ ${t("titleUpdated")}`);
  }
}

// Delete history item
function deleteHistoryItem(id: string): void {
  const record = conversionHistory.find((r) => r.id === id);
  if (!record) return;

  conversionHistory = conversionHistory.filter((r) => r.id !== id);
  saveHistory();
  updateHistoryDisplay();
  notyf.success(`✓ ${t("conversionDeleted")}`);
}

// Clear history
function clearHistory(): void {
  if (confirm("Are you sure you want to clear all conversion history?")) {
    conversionHistory = [];
    saveHistory();
    updateHistoryDisplay();
    notyf.success(`✓ ${t("historyCleared")}`);
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

  notyf.success(`✓ ${t("historyExported")}`);
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
    notyf.error("Please select a CSV file");
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

      showCSVImportDialog(parseResult);
    } catch (error) {
      console.error("CSV parsing error:", error);
      notyf.error(t("csvError"));
    }
  };

  reader.readAsText(file);

  // Reset the input value to allow selecting the same file again
  target.value = "";
}

function showCSVImportDialog(parseResult: CSVParseResult): void {
  const modal = document.createElement("div");
  modal.className = "csv-import-modal";

  const detectedTypeText = parseResult.coordinateType
    ? `${t("csvDetectedAs")} ${parseResult.coordinateType}`
    : "";

  const columnMappingHTML = parseResult.detectedColumns
    ? `<div class="column-mapping">
        <h4>${t("csvColumnMapping")}</h4>
        ${Object.entries(parseResult.detectedColumns)
          .map(([key, value]) => `<div>${key}: <strong>${value}</strong></div>`)
          .join("")}
      </div>`
    : "";

  modal.innerHTML = `
    <div class="csv-import-dialog max-h-[95vh] overflow-y-auto">
      <h3>${t("selectCoordinateType")}</h3>
      ${
        detectedTypeText
          ? `<p class="detected-type">${detectedTypeText}</p>`
          : ""
      }
      ${columnMappingHTML}
      
      <div class="coordinate-type-selection">
        <label>
          <input type="radio" name="coordinate-type" value="UTM" ${
            parseResult.coordinateType === "UTM" ? "checked" : ""
          }>
          UTM
        </label>
        <label>
          <input type="radio" name="coordinate-type" value="WGS84" ${
            parseResult.coordinateType === "WGS84" ? "checked" : ""
          }>
          WGS84
        </label>
      </div>

      <div id="manual-column-mapping" style="display: none;" class="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <h4>${t("manualColumnMapping")}</h4>
        <div id="column-mapping-fields"></div>
      </div>
      
      <div class="csv-preview">
        <h4>${t("csvPreview", {
          count: Math.min(parseResult.data.length, 100),
        })}</h4>
        <div class="rounded-md border border-white/10 bg-white/5">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                ${parseResult.headers
                  .map(
                    (header) =>
                      `<th class="bg-white/10 px-2 py-2 text-left font-semibold text-blue-400 border-b border-white/10 sticky top-0 z-10">${header}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
          </table>
          <div class="max-h-48 overflow-y-auto">
            <table class="w-full border-collapse text-sm">
              <tbody>
                ${parseResult.data
                  .slice(0, 100)
                  .map(
                    (row) =>
                      `<tr class="border-b border-white/10 last:border-b-0">${parseResult.headers
                        .map(
                          (header) =>
                            `<td class="px-2 py-2 text-white max-w-32 truncate">${
                              row[header] || ""
                            }</td>`
                        )
                        .join("")}</tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button id="cancel-csv-import" class="cancel-button">${t(
          "cancelImport"
        )}</button>
        <button id="confirm-csv-import" class="confirm-button">${t(
          "confirmImport"
        )}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Helper function to create column select options
  const createColumnSelectOptions = (): string => {
    return `<option value="">${t("selectColumn")}</option>` +
      parseResult.headers
        .map(header => `<option value="${header}">${header}</option>`)
        .join("");
  };

  // Helper function to show manual column mapping
  const showManualColumnMapping = (coordinateType: CoordinateType): void => {
    const manualMappingDiv = modal.querySelector("#manual-column-mapping") as HTMLDivElement;
    const fieldsContainer = modal.querySelector("#column-mapping-fields")!;
    
    if (coordinateType === "UTM") {
      fieldsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="easting-column" class="mb-2 text-white font-medium">${t("selectEastingColumn")}</label>
            <select id="easting-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
              ${createColumnSelectOptions()}
            </select>
          </div>
          <div class="flex flex-col">
            <label for="northing-column" class="mb-2 text-white font-medium">${t("selectNorthingColumn")}</label>
            <select id="northing-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
              ${createColumnSelectOptions()}
            </select>
          </div>
          <div class="flex flex-col">
            <label for="zone-column" class="mb-2 text-white font-medium">${t("selectZoneColumn")}</label>
            <select id="zone-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
              ${createColumnSelectOptions()}
            </select>
          </div>
          <div class="flex flex-col">
            <label for="hemisphere-column" class="mb-2 text-white font-medium">${t("selectHemisphereColumn")}</label>
            <select id="hemisphere-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
              ${createColumnSelectOptions()}
            </select>
          </div>
        </div>
      `;
    } else {
      fieldsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="latitude-column" class="mb-2 text-white font-medium">${t("selectLatitudeColumn")}</label>
            <select id="latitude-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
              ${createColumnSelectOptions()}
            </select>
          </div>
          <div class="flex flex-col">
            <label for="longitude-column" class="mb-2 text-white font-medium">${t("selectLongitudeColumn")}</label>
            <select id="longitude-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
              ${createColumnSelectOptions()}
            </select>
          </div>
        </div>
      `;
    }
    
    manualMappingDiv.style.display = "block";
  };

  // Helper function to hide manual column mapping
  const hideManualColumnMapping = (): void => {
    const manualMappingDiv = modal.querySelector("#manual-column-mapping") as HTMLDivElement;
    manualMappingDiv.style.display = "none";
  };

  // Helper function to check if manual mapping is needed
  const isManualMappingNeeded = (selectedType: CoordinateType): boolean => {
    return selectedType !== parseResult.coordinateType || !parseResult.detectedColumns;
  };

  // Add event listeners for radio buttons
  const radioButtons = modal.querySelectorAll<HTMLInputElement>('input[name="coordinate-type"]');
  radioButtons.forEach(radio => {
    radio.addEventListener("change", () => {
      const selectedType = radio.value as CoordinateType;
      if (isManualMappingNeeded(selectedType)) {
        showManualColumnMapping(selectedType);
      } else {
        hideManualColumnMapping();
      }
    });
  });

  // Show manual mapping if needed on initial load
  const initialSelectedType = modal.querySelector<HTMLInputElement>(
    'input[name="coordinate-type"]:checked'
  )?.value as CoordinateType;
  
  if (initialSelectedType && isManualMappingNeeded(initialSelectedType)) {
    showManualColumnMapping(initialSelectedType);
  }

  // Add event listeners for action buttons
  const cancelBtn = modal.querySelector("#cancel-csv-import")!;
  const confirmBtn = modal.querySelector("#confirm-csv-import")!;

  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  confirmBtn.addEventListener("click", () => {
    const selectedType = modal.querySelector<HTMLInputElement>(
      'input[name="coordinate-type"]:checked'
    )?.value as CoordinateType;

    if (!selectedType) {
      notyf.error("Please select a coordinate type");
      return;
    }

    let columnMapping: ManualColumnMapping | undefined;

    // If manual mapping is shown, collect the column mappings
    if (isManualMappingNeeded(selectedType)) {
      const manualMappingDiv = modal.querySelector("#manual-column-mapping") as HTMLDivElement;
      if (manualMappingDiv.style.display !== "none") {
        columnMapping = {};
        
        if (selectedType === "UTM") {
          const eastingSelect = modal.querySelector<HTMLSelectElement>("#easting-column");
          const northingSelect = modal.querySelector<HTMLSelectElement>("#northing-column");
          const zoneSelect = modal.querySelector<HTMLSelectElement>("#zone-column");
          const hemisphereSelect = modal.querySelector<HTMLSelectElement>("#hemisphere-column");
          
          if (!eastingSelect?.value || !northingSelect?.value || !zoneSelect?.value || !hemisphereSelect?.value) {
            notyf.error(t("columnMappingRequired"));
            return;
          }
          
          columnMapping.easting = eastingSelect.value;
          columnMapping.northing = northingSelect.value;
          columnMapping.zone = zoneSelect.value;
          columnMapping.hemisphere = hemisphereSelect.value;
        } else {
          const latitudeSelect = modal.querySelector<HTMLSelectElement>("#latitude-column");
          const longitudeSelect = modal.querySelector<HTMLSelectElement>("#longitude-column");
          
          if (!latitudeSelect?.value || !longitudeSelect?.value) {
            notyf.error(t("columnMappingRequired"));
            return;
          }
          
          columnMapping.latitude = latitudeSelect.value;
          columnMapping.longitude = longitudeSelect.value;
        }
      }
    }

    document.body.removeChild(modal);
    processCSVData(parseResult, selectedType, columnMapping);
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

function processCSVData(
  parseResult: CSVParseResult,
  coordinateType: CoordinateType,
  manualColumnMapping?: ManualColumnMapping
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
    notyf.success(`✓ ${message}`);

    // Offer to download converted data
    offerCSVDownload(convertedData, coordinateType, parseResult.headers);
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
 */
function offerCSVDownload(
  convertedData: any[],
  coordinateType: CoordinateType,
  originalHeaders: string[]
): void {
  const modal = document.createElement("div");
  modal.className = "csv-download-modal";

  const targetType = coordinateType === "UTM" ? "WGS84" : "UTM";

  modal.innerHTML = `
    <div class="csv-download-dialog max-h-[80vh] overflow-y-auto">
      <h3>${t("downloadConvertedCSV")}</h3>
      <p>Your CSV has been converted from ${coordinateType} to ${targetType}. Would you like to download the results?</p>
      
      <div class="dialog-actions">
        <button id="cancel-csv-download" class="cancel-button">Cancel</button>
        <button id="confirm-csv-download" class="confirm-button">${t(
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
    downloadConvertedCSV(convertedData, coordinateType, originalHeaders);
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
 */
function downloadConvertedCSV(
  convertedData: any[],
  coordinateType: CoordinateType,
  originalHeaders: string[]
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
  a.download = `converted_${coordinateType}_to_${targetType}_${
    new Date().toISOString().split("T")[0]
  }.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  notyf.success(`✓ ${t("csvDownloaded")}`);
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
const importCSVBtn =
  document.querySelector<HTMLButtonElement>("#import-csv-btn")!;
const csvFileInput =
  document.querySelector<HTMLInputElement>("#csv-file-input")!;
const importExcelBtn =
  document.querySelector<HTMLButtonElement>("#import-excel-btn")!;
const excelFileInput =
  document.querySelector<HTMLInputElement>("#excel-file-input")!;

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
    notyf.success(`✓ ${t("convertedUTMToWGS84")}`);

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
    notyf.success(`✓ ${t("convertedWGS84ToUTM")}`);

    // Add to history
    const title = conversionTitleInput.value.trim();
    addToHistory("WGS84_TO_UTM", { latitude, longitude }, utm, title);

    // Clear title input after successful conversion
    conversionTitleInput.value = "";
  } catch (error) {
    notyf.error(t("conversionError"));
  }
}

convertToWGS84Btn.addEventListener("click", convertUTMToWGS84);
convertToUTMBtn.addEventListener("click", convertWGS84ToUTM);
clearHistoryBtn.addEventListener("click", clearHistory);
exportHistoryBtn.addEventListener("click", exportHistory);
importCSVBtn.addEventListener("click", importCSVFile);
csvFileInput.addEventListener("change", handleCSVFileSelect);
importExcelBtn.addEventListener("click", importExcelFile);
excelFileInput.addEventListener("change", handleExcelFileSelect);

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
      (savedLanguage === "he" || savedLanguage === "en" || savedLanguage === "it")
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
  notyf.success(`✓ ${t("result")}: ${languageName}`);
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
    notyf.error("Please select an Excel file (.xlsx or .xls)");
    return;
  }

  // Show loading notification
  notyf.success("Processing Excel file...");

  parseExcel(file)
    .then((parseResult) => {
      if (parseResult.data.length === 0) {
        notyf.error(t("noValidData"));
        return;
      }

      // Use the same dialog as CSV since the result structure is compatible
      showCSVImportDialog(parseResult);
    })
    .catch((error) => {
      console.error("Excel parsing error:", error);
      notyf.error(t("excelError"));
    });

  // Reset the input value to allow selecting the same file again
  target.value = "";
}
