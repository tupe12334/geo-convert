import { getPhone } from "../../utils/getPhone";

/**
 * Creates and returns an info button element with proper styling and event handling
 * @returns HTMLButtonElement - The configured info button
 */
export const createInfoButton = (): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = "info-btn";
  button.className =
    "bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm h-full flex items-center justify-center hover:bg-white/15 hover:border-white/30 transition-all duration-200";
  button.title = "Info";
  button.innerHTML = '<i data-lucide="info" class="w-4 h-4"></i>';

  button.addEventListener("click", showInfoDialog);

  return button;
};

/**
 * Shows the info dialog modal with contact information
 */
const showInfoDialog = (): void => {
  const modal = document.createElement("div");
  modal.className = "info-modal";
  modal.innerHTML = `
    <div class="info-dialog">
      <h3>Ofek Gabay - אופק גבאי</h3>
      <p>${getPhone()}</p>
      <div class="dialog-actions">
        <button id="close-info" class="confirm-button">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // Close button handler
  modal.querySelector("#close-info")!.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
};
