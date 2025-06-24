import type { CSVImportDialogOptions, CSVImportDialogState } from "./types";
import type {
  CoordinateType,
  ManualColumnMapping,
  CSVParseResult,
} from "../../converters/types";

/**
 * Creates and shows a CSV import dialog for coordinate type selection and column mapping
 *
 * @param options - Configuration options for the dialog
 * @returns Promise that resolves when dialog is closed
 */
export const showCSVImportDialog = (
  options: CSVImportDialogOptions
): Promise<void> => {
  return new Promise((resolve) => {
    const { parseResult, onConfirm, onCancel, t, showError } = options;

    const modal = createModalElement();
    const state: CSVImportDialogState = {
      selectedCoordinateType: parseResult.coordinateType,
      isManualMappingVisible: false,
      manualMapping: {},
    };

    // Build dialog HTML
    modal.innerHTML = createDialogHTML(parseResult, t);

    // Append to body
    document.body.appendChild(modal);

    // Initialize event listeners
    setupEventListeners(
      modal,
      parseResult,
      state,
      t,
      showError,
      onConfirm,
      onCancel,
      resolve
    );

    // Initialize state
    initializeDialogState(modal, parseResult, state);
  });
};

/**
 * Creates the modal container element
 */
const createModalElement = (): HTMLDivElement => {
  const modal = document.createElement("div");
  modal.className = "csv-import-modal";
  return modal;
};

/**
 * Creates the main dialog HTML content
 */
const createDialogHTML = (
  parseResult: CSVParseResult,
  t: (key: string, params?: Record<string, unknown>) => string
): string => {
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

  return `
    <div class="csv-import-dialog max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300">
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
        <div class="rounded-md border border-white/10 bg-white/5 max-h-64 overflow-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-300">
          <table class="w-full border-collapse text-sm table-fixed">
            <thead class="sticky top-0 z-10">
              <tr>
                ${parseResult.headers
                  .map(
                    (header: string) =>
                      `<th class="bg-white/10 px-2 py-2 text-left font-semibold text-blue-400 border-b border-white/10 w-32 min-w-0">${header}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${parseResult.data
                .slice(0, 100)
                .map(
                  (row: Record<string, string>) =>
                    `<tr class="border-b border-white/10 last:border-b-0">${parseResult.headers
                      .map(
                        (header: string) =>
                          `<td class="px-2 py-2 text-white w-32 min-w-0 truncate">${
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
};

/**
 * Sets up all event listeners for the dialog
 */
const setupEventListeners = (
  modal: HTMLDivElement,
  parseResult: CSVParseResult,
  state: CSVImportDialogState,
  t: (key: string, params?: Record<string, unknown>) => string,
  showError: (message: string) => void,
  onConfirm: (
    coordinateType: CoordinateType,
    columnMapping?: ManualColumnMapping
  ) => void,
  onCancel: () => void,
  resolve: () => void
): void => {
  // Radio button listeners
  const radioButtons = modal.querySelectorAll<HTMLInputElement>(
    'input[name="coordinate-type"]'
  );
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      const selectedType = radio.value as CoordinateType;
      state.selectedCoordinateType = selectedType;

      if (isManualMappingNeeded(selectedType, parseResult)) {
        showManualColumnMapping(modal, selectedType, parseResult, state, t);
      } else {
        hideManualColumnMapping(modal, state);
      }
    });
  });

  // Action button listeners
  const cancelBtn = modal.querySelector("#cancel-csv-import")!;
  const confirmBtn = modal.querySelector("#confirm-csv-import")!;

  cancelBtn.addEventListener("click", () => {
    cleanupModal(modal);
    onCancel();
    resolve();
  });

  confirmBtn.addEventListener("click", () => {
    if (!state.selectedCoordinateType) {
      showError(t("pleaseSelectCoordinateType"));
      return;
    }

    let columnMapping: ManualColumnMapping | undefined;

    // Collect manual mapping if needed
    if (state.isManualMappingVisible) {
      columnMapping = collectColumnMapping(
        modal,
        state.selectedCoordinateType,
        t,
        showError
      );
      if (!columnMapping) {
        return; // Error already shown
      }
    }

    cleanupModal(modal);
    onConfirm(state.selectedCoordinateType, columnMapping);
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
 * Initializes the dialog state based on parse results
 */
const initializeDialogState = (
  modal: HTMLDivElement,
  parseResult: CSVParseResult,
  state: CSVImportDialogState
): void => {
  const initialSelectedType = modal.querySelector<HTMLInputElement>(
    'input[name="coordinate-type"]:checked'
  )?.value as CoordinateType;

  if (
    initialSelectedType &&
    isManualMappingNeeded(initialSelectedType, parseResult)
  ) {
    state.selectedCoordinateType = initialSelectedType;
    showManualColumnMapping(
      modal,
      initialSelectedType,
      parseResult,
      state,
      () => ""
    );
  }
};

/**
 * Creates column select options HTML
 */
const createColumnSelectOptions = (
  parseResult: CSVParseResult,
  t: (key: string) => string
): string => {
  return (
    `<option value="">${t("selectColumn")}</option>` +
    parseResult.headers
      .map((header: string) => `<option value="${header}">${header}</option>`)
      .join("")
  );
};

/**
 * Shows the manual column mapping section
 */
const showManualColumnMapping = (
  modal: HTMLDivElement,
  coordinateType: CoordinateType,
  parseResult: CSVParseResult,
  state: CSVImportDialogState,
  t: (key: string) => string
): void => {
  const manualMappingDiv = modal.querySelector(
    "#manual-column-mapping"
  ) as HTMLDivElement;
  const fieldsContainer = modal.querySelector("#column-mapping-fields")!;

  if (coordinateType === "UTM") {
    fieldsContainer.innerHTML = createUTMColumnMapping(parseResult, t);
  } else {
    fieldsContainer.innerHTML = createWGS84ColumnMapping(parseResult, t);
  }

  manualMappingDiv.style.display = "block";
  state.isManualMappingVisible = true;
};

/**
 * Creates UTM column mapping fields
 */
const createUTMColumnMapping = (
  parseResult: CSVParseResult,
  t: (key: string) => string
): string => {
  const options = createColumnSelectOptions(parseResult, t);

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col">
        <label for="easting-column" class="mb-2 text-white font-medium">${t(
          "selectEastingColumn"
        )}</label>
        <select id="easting-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
          ${options}
        </select>
      </div>
      <div class="flex flex-col">
        <label for="northing-column" class="mb-2 text-white font-medium">${t(
          "selectNorthingColumn"
        )}</label>
        <select id="northing-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
          ${options}
        </select>
      </div>
      <div class="flex flex-col">
        <label for="zone-column" class="mb-2 text-white font-medium">${t(
          "selectZoneColumn"
        )}</label>
        <select id="zone-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
          ${options}
        </select>
      </div>
      <div class="flex flex-col">
        <label for="hemisphere-column" class="mb-2 text-white font-medium">${t(
          "selectHemisphereColumn"
        )}</label>
        <select id="hemisphere-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
          ${options}
        </select>
      </div>
    </div>
  `;
};

/**
 * Creates WGS84 column mapping fields
 */
const createWGS84ColumnMapping = (
  parseResult: CSVParseResult,
  t: (key: string) => string
): string => {
  const options = createColumnSelectOptions(parseResult, t);

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col">
        <label for="latitude-column" class="mb-2 text-white font-medium">${t(
          "selectLatitudeColumn"
        )}</label>
        <select id="latitude-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
          ${options}
        </select>
      </div>
      <div class="flex flex-col">
        <label for="longitude-column" class="mb-2 text-white font-medium">${t(
          "selectLongitudeColumn"
        )}</label>
        <select id="longitude-column" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
          ${options}
        </select>
      </div>
    </div>
  `;
};

/**
 * Hides the manual column mapping section
 */
const hideManualColumnMapping = (
  modal: HTMLDivElement,
  state: CSVImportDialogState
): void => {
  const manualMappingDiv = modal.querySelector(
    "#manual-column-mapping"
  ) as HTMLDivElement;
  manualMappingDiv.style.display = "none";
  state.isManualMappingVisible = false;
};

/**
 * Checks if manual mapping is needed for the selected coordinate type
 */
const isManualMappingNeeded = (
  selectedType: CoordinateType,
  parseResult: CSVParseResult
): boolean => {
  return (
    selectedType !== parseResult.coordinateType || !parseResult.detectedColumns
  );
};

/**
 * Collects column mapping from the form
 */
const collectColumnMapping = (
  modal: HTMLDivElement,
  coordinateType: CoordinateType,
  t: (key: string) => string,
  showError: (message: string) => void
): ManualColumnMapping | undefined => {
  const columnMapping: ManualColumnMapping = {};

  if (coordinateType === "UTM") {
    const eastingSelect =
      modal.querySelector<HTMLSelectElement>("#easting-column");
    const northingSelect =
      modal.querySelector<HTMLSelectElement>("#northing-column");
    const zoneSelect = modal.querySelector<HTMLSelectElement>("#zone-column");
    const hemisphereSelect =
      modal.querySelector<HTMLSelectElement>("#hemisphere-column");

    if (
      !eastingSelect?.value ||
      !northingSelect?.value ||
      !zoneSelect?.value ||
      !hemisphereSelect?.value
    ) {
      showError(t("columnMappingRequired"));
      return undefined;
    }

    columnMapping.easting = eastingSelect.value;
    columnMapping.northing = northingSelect.value;
    columnMapping.zone = zoneSelect.value;
    columnMapping.hemisphere = hemisphereSelect.value;
  } else {
    const latitudeSelect =
      modal.querySelector<HTMLSelectElement>("#latitude-column");
    const longitudeSelect =
      modal.querySelector<HTMLSelectElement>("#longitude-column");

    if (!latitudeSelect?.value || !longitudeSelect?.value) {
      showError(t("columnMappingRequired"));
      return undefined;
    }

    columnMapping.latitude = latitudeSelect.value;
    columnMapping.longitude = longitudeSelect.value;
  }

  return columnMapping;
};

/**
 * Removes the modal from the DOM
 */
const cleanupModal = (modal: HTMLDivElement): void => {
  if (modal.parentNode) {
    document.body.removeChild(modal);
  }
};
