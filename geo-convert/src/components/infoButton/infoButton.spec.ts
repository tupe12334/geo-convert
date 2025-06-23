/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createInfoButton } from "./infoButton";

// Mock the getPhone utility
vi.mock("../../utils/getPhone", () => ({
  getPhone: vi.fn(() => "123-456-7890"),
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
      "bg-white/10",
      "border",
      "border-white/20",
      "rounded",
      "px-3",
      "py-2",
      "text-white",
      "text-sm",
      "h-full",
      "flex",
      "items-center",
      "justify-center",
      "hover:bg-white/15",
      "hover:border-white/30",
      "transition-all",
      "duration-200",
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

    const heading = dialog?.querySelector("h3");
    expect(heading?.textContent).toBe("Ofek Gabay - אופק גבאי");
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
