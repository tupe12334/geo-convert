import { getPhone } from "../../utils/getPhone";
import { t } from "../../i18n";

/**
 * Creates and returns an info button element with proper styling and event handling
 * @returns HTMLButtonElement - The configured info button
 */
export const createInfoButton = (): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = "info-btn";
  button.className =
    "border rounded px-3 py-2 text-sm h-full flex items-center justify-center transition-all duration-200 bg-black/10 border-black/20 text-black hover:bg-black/15 hover:border-black/30 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15 dark:hover:border-white/30";
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
  modal.className =
    "info-modal fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 box-border";
  modal.innerHTML = `
    <div class="info-dialog">
      <p>${t("infoDialogMessage", { phone: getPhone() })}</p>
      <div class="dialog-actions">
        <button id="close-info" class="confirm-button">${t("close")}</button>
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
