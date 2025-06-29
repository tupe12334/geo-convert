/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createInfoButton } from "./infoButton";

// Mock the getPhone utility
vi.mock("../../utils/getPhone", () => ({
  getPhone: vi.fn(() => "123-456-7890"),
}));

// Mock the i18n module
vi.mock("../../i18n", () => ({
  t: vi.fn((key: string, params?: any) => {
    const translations: Record<string, string> = {
      infoDialogMessage:
        "מוזמנים לפנות אלי לכל בעיה - אופק גבאי {{phone}} המערכת היא הלבנה של מערכת אזרחית",
      close: "סגור",
    };
    let text = translations[key] || key;
    if (params?.phone) {
      text = text.replace("{{phone}}", params.phone);
    }
    return text;
  }),
}));

describe("createInfoButton", () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    button = createInfoButton();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should create a button element with correct attributes", () => {
    expect(button.tagName).toBe("BUTTON");
    expect(button.id).toBe("info-btn");
    expect(button.title).toBe("Info");
  });

  it("should have correct CSS classes", () => {
    const expectedClasses = [
      "border",
      "rounded",
      "px-3",
      "py-2",
      "text-sm",
      "h-full",
      "flex",
      "items-center",
      "justify-center",
      "transition-all",
      "duration-200",
      "bg-black/10",
      "border-black/20",
      "text-black",
      "hover:bg-black/15",
      "hover:border-black/30",
      "dark:bg-white/10",
      "dark:border-white/20",
      "dark:text-white",
      "dark:hover:bg-white/15",
      "dark:hover:border-white/30",
    ];

    expectedClasses.forEach((className) => {
      expect(button.classList.contains(className)).toBe(true);
    });
  });

  it("should contain an info icon", () => {
    const icon = button.querySelector('i[data-lucide="info"]');
    expect(icon).toBeTruthy();
    expect(icon?.classList.contains("w-4")).toBe(true);
    expect(icon?.classList.contains("h-4")).toBe(true);
  });

  it("should show info dialog when clicked", () => {
    button.click();

    const modal = document.querySelector(".info-modal");
    expect(modal).toBeTruthy();

    const dialog = modal?.querySelector(".info-dialog");
    expect(dialog).toBeTruthy();

    const paragraph = dialog?.querySelector("p");
    expect(paragraph?.textContent).toContain(
      "מוזמנים לפנות אלי לכל בעיה - אופק גבאי"
    );
  });

  it("should close dialog when close button is clicked", () => {
    button.click();

    const closeButton = document.querySelector(
      "#close-info"
    ) as HTMLButtonElement;
    expect(closeButton).toBeTruthy();

    closeButton.click();

    const modal = document.querySelector(".info-modal");
    expect(modal).toBeFalsy();
  });

  it("should close dialog when clicking outside", () => {
    button.click();

    const modal = document.querySelector(".info-modal") as HTMLElement;
    expect(modal).toBeTruthy();

    // Simulate clicking on the modal background
    const clickEvent = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(clickEvent, "target", { value: modal });
    modal.dispatchEvent(clickEvent);

    // Modal should be removed
    expect(document.querySelector(".info-modal")).toBeFalsy();
  });
});
