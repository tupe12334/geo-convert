import i18next from "i18next";
import en from "./en.json";
import he from "./he.json";

export const initI18n = async () => {
  await i18next.init({
    lng: "he", // Default to Hebrew
    fallbackLng: "he",
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  return i18next;
};

export const changeLanguage = (lng: string) => {
  i18next.changeLanguage(lng);
  updateDirection(lng);
  updateUI();
};

const updateDirection = (lng: string) => {
  const isRTL = lng === "he";
  const html = document.documentElement;

  if (isRTL) {
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", "he");
  } else {
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", "en");
  }

  // Add or remove RTL class for CSS styling
  if (isRTL) {
    document.body.classList.add("rtl");
    document.body.classList.remove("ltr");
  } else {
    document.body.classList.add("ltr");
    document.body.classList.remove("rtl");
  }
};

export const t = (key: string, options?: any): string =>
  i18next.t(key, options) as string;

const updateUI = () => {
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key && element instanceof HTMLElement) {
      element.textContent = t(key);
    }
  });

  // Update elements with data-i18n-placeholder attribute
  const placeholderElements = document.querySelectorAll(
    "[data-i18n-placeholder]"
  );
  placeholderElements.forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (
      key &&
      (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement)
    ) {
      element.placeholder = t(key);
    }
  });

  // Update select options
  const selectOptions = document.querySelectorAll("[data-i18n-value]");
  selectOptions.forEach((option) => {
    const key = option.getAttribute("data-i18n-value");
    if (key && option instanceof HTMLOptionElement) {
      option.textContent = t(key);
    }
  });
};

// Export updateUI and updateDirection for external use
export { updateUI };
