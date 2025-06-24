import { t } from "../../i18n";

/**
 * Creates and returns a dark mode toggle button element with proper styling and event handling
 * @returns HTMLButtonElement - The configured dark mode toggle button
 */
export const createDarkModeToggle = (): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = "dark-mode-toggle";
  button.className =
    "border rounded px-3 py-2 text-sm h-full flex items-center justify-center transition-all duration-200 bg-black/10 border-black/20 text-black hover:bg-black/15 hover:border-black/30 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15 dark:hover:border-white/30";

  // Initialize based on current theme
  updateToggleButton(button);

  button.addEventListener("click", () => {
    toggleDarkMode();
    updateToggleButton(button);
  });

  return button;
};

/**
 * Updates the toggle button appearance based on current theme
 * @param button - The toggle button element
 */
const updateToggleButton = (button: HTMLButtonElement): void => {
  const isDark = isDarkMode();

  if (isDark) {
    button.innerHTML = '<i data-lucide="sun" class="w-4 h-4"></i>';
    button.title = t("switchToLightMode");
  } else {
    button.innerHTML = '<i data-lucide="moon" class="w-4 h-4"></i>';
    button.title = t("switchToDarkMode");
  }
};

/**
 * Toggles between dark and light mode
 */
const toggleDarkMode = (): void => {
  const html = document.documentElement;
  const isDark = html.classList.contains("dark");

  if (isDark) {
    html.classList.remove("dark");
    saveDarkModePreference(false);
  } else {
    html.classList.add("dark");
    saveDarkModePreference(true);
  }
};

/**
 * Checks if dark mode is currently active
 * @returns boolean - True if dark mode is active
 */
const isDarkMode = (): boolean => {
  return document.documentElement.classList.contains("dark");
};

/**
 * Loads the saved dark mode preference and applies it
 */
export const loadDarkModePreference = (): void => {
  try {
    const saved = localStorage.getItem("geo-convert-dark-mode");
    const prefersDark = saved ? JSON.parse(saved) : true; // Default to dark mode

    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (error) {
    console.warn("Failed to load dark mode preference:", error);
    // Default to dark mode if there's an error
    document.documentElement.classList.add("dark");
  }
};

/**
 * Saves the dark mode preference to localStorage
 * @param isDark - Whether dark mode should be enabled
 */
const saveDarkModePreference = (isDark: boolean): void => {
  try {
    localStorage.setItem("geo-convert-dark-mode", JSON.stringify(isDark));
  } catch (error) {
    console.warn("Failed to save dark mode preference:", error);
  }
};
