import "./style.css";
import {
  convertUTMtoWGS84,
  convertWGS84toUTM,
  parseUTMInputs,
} from "./converters";
import { createIcons, Pencil, Trash2 } from "lucide";
import { generateId } from "./utils/generateId";
import { initI18n, changeLanguage, t } from "./i18n";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import type {
  ConversionRecord,
  UTMCoordinate,
  WGS84Coordinate,
} from "./converters/types";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div class="flex flex-wrap sm:flex-nowrap justify-between items-center mb-8 gap-4">
      <h1 class="mb-0 flex-shrink-0 leading-none text-4xl text-white" data-i18n="title">Geographic Coordinate Converter</h1>
      <div class="flex items-center gap-2 flex-shrink-0 h-[2.5rem]">
        <select id="language-select" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm h-full">
          <option value="he">עברית</option>
          <option value="en">English</option>
        </select>
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
        </div>
        
        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border utm-section">
          <h3 data-i18n="utm">UTM Coordinates</h3>
          <div class="grid grid-cols-1 gap-4 mb-6">
            <div class="flex flex-col w-full">
              <label for="easting-input">Easting (X):</label>
              <input 
                type="number" 
                id="easting-input" 
                data-i18n-placeholder="utmInputPlaceholder"
                placeholder="500000"
                step="0.01"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="northing-input">Northing (Y):</label>
              <input 
                type="number" 
                id="northing-input" 
                placeholder="4649776"
                step="0.01"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="zone-input">Zone:</label>
              <input 
                type="number" 
                id="zone-input" 
                placeholder="33"
                min="1"
                max="60"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="hemisphere-select">Hemisphere:</label>
              <select id="hemisphere-select">
                <option value="">Select</option>
                <option value="N">North (N)</option>
                <option value="S">South (S)</option>
              </select>
            </div>
          </div>
          <button id="convert-to-wgs84" data-i18n="convert">Convert to WGS84 →</button>
        </div>
        
        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border wgs84-section">
          <h3 data-i18n="wgs84">WGS84</h3>
          <div class="grid grid-cols-1 gap-4 mb-6">
            <div class="flex flex-col w-full">
              <label for="latitude-input">Latitude:</label>
              <input 
                type="number" 
                id="latitude-input" 
                data-i18n-placeholder="wgs84InputPlaceholder"
                placeholder="41.123456"
                step="0.00000001"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="longitude-input">Longitude:</label>
              <input 
                type="number" 
                id="longitude-input" 
                placeholder="2.123456"
                step="0.00000001"
              />
            </div>
          </div>
          <button id="convert-to-utm" data-i18n="convert">← Convert to UTM</button>
        </div>

        <div class="bg-white/[0.03] rounded-lg p-4 md:p-6 border border-white/10 min-w-0 w-full box-border history-section">
          <h3><span data-i18n="conversionHistory">Conversion History</span> (<span id="history-count">0</span>)</h3>
          <div class="history-controls">
            <button id="clear-history" class="clear-button" data-i18n="clearHistory">Clear History</button>
            <button id="export-history" class="export-button" data-i18n="exportHistory">Export History</button>
          </div>
          <div id="history-list" class="history-list">
            <div class="history-empty" data-i18n="noConversionsYet">No conversions yet</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
createIcons({ icons: { Pencil, Trash2 } });

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
      const time = record.timestamp.toLocaleTimeString();
      const date = record.timestamp.toLocaleDateString();
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

  const confirmMessage = record.title
    ? `Are you sure you want to delete "${record.title}"?`
    : "Are you sure you want to delete this conversion?";

  if (confirm(confirmMessage)) {
    conversionHistory = conversionHistory.filter((r) => r.id !== id);
    saveHistory();
    updateHistoryDisplay();
    notyf.success(`✓ ${t("conversionDeleted")}`);
  }
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
    if (savedLanguage && (savedLanguage === "he" || savedLanguage === "en")) {
      languageSelect.value = savedLanguage;
      changeLanguage(savedLanguage);
    } else {
      // Default to Hebrew if no preference saved
      languageSelect.value = "he";
      changeLanguage("he");
    }
  } catch (error) {
    console.warn("Failed to load language preference:", error);
    languageSelect.value = "he";
    changeLanguage("he");
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

  const languageName = target.options[target.selectedIndex].text;
  notyf.success(`✓ ${t("result")}: ${languageName}`);
});
