import type { Theme } from "./types";

/**
 * Apply the given theme to the document
 */
export const applyTheme = (theme: Theme): void => {
  const html = document.documentElement;

  if (theme === "light") {
    html.classList.add("light");
    return;
  }

  html.classList.remove("light");
};

/**
 * Load the saved theme preference or fall back to system preference
 */
export const loadTheme = (): Theme => {
  const stored = localStorage.getItem("geo-convert-theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

/**
 * Persist the theme preference
 */
export const saveTheme = (theme: Theme): void => {
  try {
    localStorage.setItem("geo-convert-theme", theme);
  } catch (error) {
    console.warn("Failed to save theme:", error);
  }
};

/**
 * Creates a dark mode toggle button
 */
export const createThemeToggle = (): HTMLButtonElement => {
  const button = document.createElement("button");
  button.id = "theme-toggle";
  button.className =
    "bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm h-full flex items-center justify-center hover:bg-white/15 hover:border-white/30 transition-all duration-200";
  button.title = "Toggle theme";

  const icon = document.createElement("i");
  button.appendChild(icon);

  const setIcon = (theme: Theme): void => {
    icon.dataset.lucide = theme === "light" ? "moon" : "sun";
  };

  const initial = loadTheme();
  applyTheme(initial);
  setIcon(initial);

  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.classList.contains("light")
      ? "dark"
      : "light";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
    setIcon(nextTheme);
  });

  return button;
};
