import type {
  BulkConversionDialogOptions,
  BulkConversionDialogState,
  BulkCoordinateEntry,
} from "./types";
import type { CoordinateType } from "../../converters/types";
import { convertUTMtoWGS84, convertWGS84toUTM } from "../../converters";

/**
 * Creates and shows a bulk conversion dialog for entering multiple coordinate points
 *
 * @param options - Configuration options for the dialog
 * @returns Promise that resolves when dialog is closed
 */
export const showBulkConversionDialog = (
  options: BulkConversionDialogOptions
): Promise<void> => {
  return new Promise((resolve) => {
    const { onConfirm, onCancel, t, showError, showSuccess } = options;

    const modal = createModalElement();
    const state: BulkConversionDialogState = {
      coordinateType: "WGS84",
      entries: [createEmptyEntry()],
      results: [],
    };

    // Build dialog HTML
    modal.innerHTML = createDialogHTML(t);

    // Append to body
    document.body.appendChild(modal);

    // Initialize event listeners
    setupEventListeners(
      modal,
      state,
      t,
      showError,
      showSuccess,
      onConfirm,
      onCancel,
      resolve
    );

    // Initialize state
    updateEntriesDisplay(modal, state, t);
  });
};

/**
 * Creates the modal container element
 */
const createModalElement = (): HTMLDivElement => {
  const modal = document.createElement("div");
  modal.className = "bulk-conversion-modal";
  return modal;
};

/**
 * Creates an empty coordinate entry
 */
const createEmptyEntry = (): BulkCoordinateEntry => ({
  id: generateEntryId(),
  title: "",
  coordinates: {},
});

/**
 * Generates a unique ID for entries
 */
const generateEntryId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Creates the main dialog HTML content
 */
const createDialogHTML = (
  t: (key: string, params?: Record<string, unknown>) => string
): string => {
  return `
    <div class="bulk-conversion-dialog max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300">
      <h3 class="text-lg sm:text-xl font-bold mb-4">${t("bulkConversion")}</h3>
      
      <div class="coordinate-type-selection mb-6">
        <h4 class="text-base font-semibold mb-2">${t(
          "selectCoordinateTypeToConvert"
        )}</h4>
        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input type="radio" name="bulk-coordinate-type" value="WGS84" checked>
            <span>${t("convertWGS84ToUTM")}</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" name="bulk-coordinate-type" value="UTM">
            <span>${t("convertUTMToWGS84")}</span>
          </label>
        </div>
      </div>

      <div class="entries-section mb-6">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-base font-semibold">${t("coordinateEntries")}</h4>
          <button id="add-entry-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            ${t("addEntry")}
          </button>
        </div>
        <div id="entries-container" class="space-y-4">
          <!-- Entries will be populated here -->
        </div>
      </div>

      <div class="results-section mb-6" id="results-section" style="display: none;">
        <h4 class="text-base font-semibold mb-4">${t("conversionResults")}</h4>
        <div id="results-container" class="bg-white/5 rounded-lg p-4 border border-white/10 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-400">
          <!-- Results will be populated here -->
        </div>
      </div>
      
      <div class="dialog-actions flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button id="cancel-bulk-conversion" class="cancel-button w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3">${t(
          "cancel"
        )}</button>
        <button id="convert-bulk" class="confirm-button w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3">${t(
          "convertAll"
        )}</button>
        <button id="confirm-bulk-conversion" class="confirm-button w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3" style="display: none;">${t(
          "addToHistory"
        )}</button>
      </div>
    </div>
  `;
};

/**
 * Sets up all event listeners for the dialog
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const setupEventListeners = (
  modal: HTMLDivElement,
  state: BulkConversionDialogState,
  t: (key: string, params?: Record<string, unknown>) => string,
  showError: (message: string) => void,
  showSuccess: (message: string) => void,
  onConfirm: (results: any[]) => void,
  onCancel: () => void,
  resolve: () => void
): void => {
  // TypeScript incorrectly reports state as unused, but it's used throughout this function
  // Coordinate type selection
  const radioButtons = modal.querySelectorAll<HTMLInputElement>(
    'input[name="bulk-coordinate-type"]'
  );
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      state.coordinateType = radio.value as CoordinateType;
      updateEntriesDisplay(modal, state, t);
      hideResults(modal);
    });
  });

  // Add entry button
  const addEntryBtn = modal.querySelector("#add-entry-btn")!;
  addEntryBtn.addEventListener("click", () => {
    state.entries.push(createEmptyEntry());
    updateEntriesDisplay(modal, state, t);
  });

  // Convert button
  const convertBtn = modal.querySelector("#convert-bulk")!;
  convertBtn.addEventListener("click", () => {
    performBulkConversion(modal, state, t, showError, showSuccess);
  });

  // Cancel button
  const cancelBtn = modal.querySelector("#cancel-bulk-conversion")!;
  cancelBtn.addEventListener("click", () => {
    cleanupModal(modal);
    onCancel();
    resolve();
  });

  // Confirm button (add to history)
  const confirmBtn = modal.querySelector("#confirm-bulk-conversion")!;
  confirmBtn.addEventListener("click", () => {
    cleanupModal(modal);
    onConfirm(state.results);
    resolve();
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      cleanupModal(modal);
      onCancel();
      resolve();
    }
  });
};

/**
 * Updates the entries display based on current state
 */
const updateEntriesDisplay = (
  modal: HTMLDivElement,
  state: BulkConversionDialogState,
  t: (key: string, params?: Record<string, unknown>) => string
): void => {
  const container = modal.querySelector("#entries-container")!;

  container.innerHTML = state.entries
    .map((entry: BulkCoordinateEntry, index: number) =>
      createEntryHTML(entry, index, state.coordinateType, t)
    )
    .join("");

  // Add event listeners for entry controls
  setupEntryEventListeners(modal, state, t);
};

/**
 * Creates HTML for a single coordinate entry
 */
const createEntryHTML = (
  entry: BulkCoordinateEntry,
  index: number,
  coordinateType: CoordinateType,
  t: (key: string, params?: Record<string, unknown>) => string
): string => {
  const fieldsHTML =
    coordinateType === "WGS84"
      ? createWGS84FieldsHTML(entry, t)
      : createUTMFieldsHTML(entry, t);

  return `
    <div class="entry-item bg-white/[0.03] rounded-lg p-4 border border-white/10" data-entry-id="${
      entry.id
    }">
      <div class="flex justify-between items-center mb-3">
        <h5 class="font-medium text-sm">${t("entry")} ${index + 1}</h5>
        <button class="remove-entry-btn text-red-400 hover:text-red-300 text-sm" data-entry-id="${
          entry.id
        }">
          ${t("remove")}
        </button>
      </div>
      
      <div class="mb-3">
        <label class="block text-sm font-medium mb-1">${t("entryTitle")}</label>
        <input 
          type="text" 
          class="entry-title w-full text-sm" 
          data-entry-id="${entry.id}"
          placeholder="${t("entryTitlePlaceholder")}"
          value="${entry.title}"
        />
      </div>
      
      ${fieldsHTML}
    </div>
  `;
};

/**
 * Creates WGS84 coordinate input fields
 */
const createWGS84FieldsHTML = (
  entry: BulkCoordinateEntry,
  t: (key: string, params?: Record<string, unknown>) => string
): string => {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium mb-1">Latitude:</label>
        <input 
          type="number" 
          step="0.00000001" 
          class="coordinate-input w-full text-sm" 
          data-entry-id="${entry.id}"
          data-field="latitude"
          placeholder="${t("latitudePlaceholder")}"
          value="${entry.coordinates.latitude || ""}"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Longitude:</label>
        <input 
          type="number" 
          step="0.00000001" 
          class="coordinate-input w-full text-sm" 
          data-entry-id="${entry.id}"
          data-field="longitude"
          placeholder="${t("longitudePlaceholder")}"
          value="${entry.coordinates.longitude || ""}"
        />
      </div>
    </div>
  `;
};

/**
 * Creates UTM coordinate input fields
 */
const createUTMFieldsHTML = (
  entry: BulkCoordinateEntry,
  t: (key: string, params?: Record<string, unknown>) => string
): string => {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium mb-1">Easting (X):</label>
        <input 
          type="number" 
          step="0.01" 
          class="coordinate-input w-full text-sm" 
          data-entry-id="${entry.id}"
          data-field="easting"
          placeholder="${t("eastingPlaceholder")}"
          value="${entry.coordinates.easting || ""}"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Northing (Y):</label>
        <input 
          type="number" 
          step="0.01" 
          class="coordinate-input w-full text-sm" 
          data-entry-id="${entry.id}"
          data-field="northing"
          placeholder="${t("northingPlaceholder")}"
          value="${entry.coordinates.northing || ""}"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">${t("zone")}:</label>
        <input 
          type="number" 
          min="1" 
          max="60" 
          class="coordinate-input w-full text-sm" 
          data-entry-id="${entry.id}"
          data-field="zone"
          placeholder="${t("zonePlaceholder")}"
          value="${entry.coordinates.zone || ""}"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">${t(
          "hemisphere"
        )}:</label>
        <select 
          class="coordinate-input w-full text-sm" 
          data-entry-id="${entry.id}"
          data-field="hemisphere"
        >
          <option value="">${t("select")}</option>
          <option value="N" ${
            entry.coordinates.hemisphere === "N" ? "selected" : ""
          }>${t("north")}</option>
          <option value="S" ${
            entry.coordinates.hemisphere === "S" ? "selected" : ""
          }>${t("south")}</option>
        </select>
      </div>
    </div>
  `;
};

/**
 * Sets up event listeners for entry controls
 */
const setupEntryEventListeners = (
  modal: HTMLDivElement,
  state: BulkConversionDialogState,
  t: (key: string, params?: Record<string, unknown>) => string
): void => {
  // Entry title inputs
  const titleInputs = modal.querySelectorAll<HTMLInputElement>(".entry-title");
  titleInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const entryId = target.dataset.entryId!;
      const entry = state.entries.find(
        (e: BulkCoordinateEntry) => e.id === entryId
      );
      if (entry) {
        entry.title = target.value;
      }
    });
  });

  // Coordinate inputs
  const coordinateInputs =
    modal.querySelectorAll<HTMLInputElement>(".coordinate-input");
  coordinateInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const entryId = target.dataset.entryId!;
      const field = target.dataset.field!;
      const entry = state.entries.find(
        (e: BulkCoordinateEntry) => e.id === entryId
      );
      if (entry) {
        if (field === "hemisphere") {
          entry.coordinates[field] = target.value as "N" | "S";
        } else {
          const numValue = parseFloat(target.value);
          if (
            field === "latitude" ||
            field === "longitude" ||
            field === "easting" ||
            field === "northing" ||
            field === "zone"
          ) {
            (entry.coordinates as any)[field] = isNaN(numValue)
              ? undefined
              : numValue;
          }
        }
      }
    });
  });

  // Remove entry buttons
  const removeButtons =
    modal.querySelectorAll<HTMLButtonElement>(".remove-entry-btn");
  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const entryId = (e.target as HTMLButtonElement).dataset.entryId!;
      if (state.entries.length > 1) {
        state.entries = state.entries.filter(
          (entry: BulkCoordinateEntry) => entry.id !== entryId
        );
        updateEntriesDisplay(modal, state, t);
      }
    });
  });
};

/**
 * Performs bulk conversion of all entries
 */
const performBulkConversion = (
  modal: HTMLDivElement,
  state: BulkConversionDialogState,
  t: (key: string, params?: Record<string, unknown>) => string,
  showError: (message: string) => void,
  showSuccess: (message: string) => void
): void => {
  const validEntries = state.entries.filter((entry: BulkCoordinateEntry) => {
    if (state.coordinateType === "WGS84") {
      return (
        entry.coordinates.latitude !== undefined &&
        entry.coordinates.longitude !== undefined &&
        !isNaN(entry.coordinates.latitude) &&
        !isNaN(entry.coordinates.longitude)
      );
    } else {
      return (
        entry.coordinates.easting !== undefined &&
        entry.coordinates.northing !== undefined &&
        entry.coordinates.zone !== undefined &&
        entry.coordinates.hemisphere &&
        !isNaN(entry.coordinates.easting) &&
        !isNaN(entry.coordinates.northing) &&
        !isNaN(entry.coordinates.zone)
      );
    }
  });

  if (validEntries.length === 0) {
    showError(t("noValidEntries"));
    return;
  }

  const results: any[] = [];
  const errors: string[] = [];

  for (const entry of validEntries) {
    try {
      if (state.coordinateType === "WGS84") {
        const wgs84 = {
          latitude: entry.coordinates.latitude!,
          longitude: entry.coordinates.longitude!,
        };
        const utm = convertWGS84toUTM(wgs84);

        results.push({
          title: entry.title || `Entry ${state.entries.indexOf(entry) + 1}`,
          input: wgs84,
          output: utm,
          type: "WGS84_TO_UTM" as const,
        });
      } else {
        const utm = {
          easting: entry.coordinates.easting!,
          northing: entry.coordinates.northing!,
          zone: entry.coordinates.zone!,
          hemisphere: entry.coordinates.hemisphere! as "N" | "S",
        };
        const wgs84 = convertUTMtoWGS84(utm);

        results.push({
          title: entry.title || `Entry ${state.entries.indexOf(entry) + 1}`,
          input: utm,
          output: wgs84,
          type: "UTM_TO_WGS84" as const,
        });
      }
    } catch (error) {
      errors.push(
        `${
          entry.title || `Entry ${state.entries.indexOf(entry) + 1}`
        }: ${error}`
      );
    }
  }

  if (results.length > 0) {
    state.results = results;
    displayResults(modal, state);
    showSuccess(t("bulkConversionComplete", { count: results.length }));

    // Show the confirm button and hide convert button
    const convertBtn = modal.querySelector("#convert-bulk") as HTMLElement;
    const confirmBtn = modal.querySelector(
      "#confirm-bulk-conversion"
    ) as HTMLElement;
    convertBtn.style.display = "none";
    confirmBtn.style.display = "block";
  }

  if (errors.length > 0) {
    console.warn("Bulk conversion errors:", errors);
    if (results.length === 0) {
      showError(t("allConversionsFailed"));
    }
  }
};

/**
 * Displays the conversion results
 */
const displayResults = (
  modal: HTMLDivElement,
  state: BulkConversionDialogState
): void => {
  const resultsSection = modal.querySelector("#results-section") as HTMLElement;
  const resultsContainer = modal.querySelector("#results-container")!;

  resultsContainer.innerHTML = state.results
    .map((result: any) => {
      const inputStr =
        state.coordinateType === "WGS84"
          ? `Lat: ${result.input.latitude.toFixed(
              8
            )}, Lng: ${result.input.longitude.toFixed(8)}`
          : `E: ${result.input.easting.toFixed(
              2
            )}, N: ${result.input.northing.toFixed(2)}, Zone: ${
              result.input.zone
            }${result.input.hemisphere}`;

      const outputStr =
        state.coordinateType === "WGS84"
          ? `E: ${result.output.easting.toFixed(
              2
            )}, N: ${result.output.northing.toFixed(2)}, Zone: ${
              result.output.zone
            }${result.output.hemisphere}`
          : `Lat: ${result.output.latitude.toFixed(
              8
            )}, Lng: ${result.output.longitude.toFixed(8)}`;

      return `
        <div class="result-item bg-white/[0.03] rounded p-3 border border-white/10 mb-2">
          <div class="font-medium text-sm mb-1">${result.title}</div>
          <div class="text-xs text-white/70 mb-1">Input: ${inputStr}</div>
          <div class="text-xs text-white/70">Output: ${outputStr}</div>
        </div>
      `;
    })
    .join("");

  resultsSection.style.display = "block";
};

/**
 * Hides the results section
 */
const hideResults = (modal: HTMLDivElement): void => {
  const resultsSection = modal.querySelector("#results-section") as HTMLElement;
  const convertBtn = modal.querySelector("#convert-bulk") as HTMLElement;
  const confirmBtn = modal.querySelector(
    "#confirm-bulk-conversion"
  ) as HTMLElement;

  resultsSection.style.display = "none";
  convertBtn.style.display = "block";
  confirmBtn.style.display = "none";
};

/**
 * Cleans up the modal element
 */
const cleanupModal = (modal: HTMLDivElement): void => {
  document.body.removeChild(modal);
};
