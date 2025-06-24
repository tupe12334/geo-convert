/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createThemeToggle, applyTheme } from "./themeToggle";

describe("createThemeToggle", () => {
  let button: HTMLButtonElement;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    button = createThemeToggle();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("should create a button element", () => {
    expect(button.tagName).toBe("BUTTON");
    expect(button.id).toBe("theme-toggle");
  });

  it("should toggle theme class on click", () => {
    document.body.appendChild(button);

    expect(document.documentElement.classList.contains("light")).toBe(false);
    button.click();
    expect(document.documentElement.classList.contains("light")).toBe(true);
    button.click();
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });
});

describe("applyTheme", () => {
  afterEach(() => {
    document.documentElement.className = "";
  });

  it("should apply light theme", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("should apply dark theme", () => {
    document.documentElement.classList.add("light");
    applyTheme("dark");
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });
});
