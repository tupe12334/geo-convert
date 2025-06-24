import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createDarkModeToggle, loadDarkModePreference } from "./darkModeToggle";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock i18n
vi.mock("../../i18n", () => ({
  t: vi.fn((key: string) => key),
}));

describe("createDarkModeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.className = "";
  });

  it("should create a button element with correct attributes", () => {
    const button = createDarkModeToggle();

    expect(button.tagName).toBe("BUTTON");
    expect(button.id).toBe("dark-mode-toggle");
    expect(button.className).toContain("bg-white/10");
    expect(button.className).toContain("border");
    expect(button.className).toContain("rounded");
  });

  it("should show moon icon when in light mode", () => {
    // Ensure we're in light mode
    document.documentElement.classList.remove("dark");
    
    const button = createDarkModeToggle();
    
    expect(button.innerHTML).toContain('data-lucide="moon"');
    expect(button.title).toBe("switchToDarkMode");
  });

  it("should show sun icon when in dark mode", () => {
    // Set dark mode
    document.documentElement.classList.add("dark");
    
    const button = createDarkModeToggle();
    
    expect(button.innerHTML).toContain('data-lucide="sun"');
    expect(button.title).toBe("switchToLightMode");
  });

  it("should toggle dark mode when clicked", () => {
    const button = createDarkModeToggle();
    
    // Initially in light mode
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    
    // Click to toggle to dark mode
    button.click();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "geo-convert-dark-mode",
      "true"
    );
    
    // Click to toggle back to light mode
    button.click();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "geo-convert-dark-mode",
      "false"
    );
  });

  it("should update button appearance when toggled", () => {
    const button = createDarkModeToggle();
    
    // Initially should show moon (light mode)
    expect(button.innerHTML).toContain('data-lucide="moon"');
    
    // Toggle to dark mode
    button.click();
    expect(button.innerHTML).toContain('data-lucide="sun"');
    
    // Toggle back to light mode
    button.click();
    expect(button.innerHTML).toContain('data-lucide="moon"');
  });
});

describe("loadDarkModePreference", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.className = "";
  });

  it("should load saved dark mode preference", () => {
    localStorageMock.getItem.mockReturnValue("true");
    
    loadDarkModePreference();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith("geo-convert-dark-mode");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should load saved light mode preference", () => {
    localStorageMock.getItem.mockReturnValue("false");
    
    loadDarkModePreference();
    
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should default to dark mode when no preference is saved", () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    loadDarkModePreference();
    
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should default to dark mode when localStorage fails", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });
    
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    loadDarkModePreference();
    
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load dark mode preference:",
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});
