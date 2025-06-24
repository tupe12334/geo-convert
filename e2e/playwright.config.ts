import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const browsers = [
  {
    name: "chromium",
    device: devices["Desktop Chrome"],
  },
  {
    name: "firefox",
    device: devices["Desktop Firefox"],
  },
  {
    name: "webkit",
    device: devices["Desktop Safari"],
  },
] as const;

const colorSchemes: Array<"light" | "dark"> = ["light", "dark"];

export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4173",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Configure screenshot mode for visual testing */
    screenshot: "only-on-failure",
  },

  /* Configure screenshot options */
  expect: {
    /* Configure screenshot comparison threshold */
    toHaveScreenshot: {
      threshold: 0.2,
    },
  },

  /* Configure projects for major browsers in both color schemes */
  projects: browsers.flatMap(({ name, device }) =>
    colorSchemes.map((colorScheme) => ({
      name: `${name}-${colorScheme}`,
      use: { ...device, colorScheme },
    })),
  ),

  // Test against mobile viewports.
  // {
  //   name: 'Mobile Chrome',
  //   use: { ...devices['Pixel 5'] },
  // },
  // {
  //   name: 'Mobile Safari',
  //   use: { ...devices['iPhone 12'] },
  // },

  // Test against branded browsers.
  // {
  //   name: 'Microsoft Edge',
  //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
  // },
  // {
  //   name: 'Google Chrome',
  //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
  // },

  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      "pnpm --dir ../geo-convert build && pnpm --dir ../geo-convert preview --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
});
