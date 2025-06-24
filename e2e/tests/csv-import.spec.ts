import { test, expect } from "@playwright/test";
import { GeoConvertPage } from "./pageObjects/GeoConvertPage";
import { readFile } from "fs/promises";

test.describe("CSV import", () => {
  test("should process sample csv and add rows to history", async ({
    page,
  }) => {
    const geoPage = new GeoConvertPage(page);
    // Use a relative path that should work with the test setup
    const csvPath = "./examples/sample.csv";

    await geoPage.goto();
    await geoPage.uploadCSV(csvPath);
    await geoPage.confirmCSVImport();

    // Download the converted file and validate as snapshot
    const downloadResult = await geoPage.downloadCSV();

    const fileContent = await readFile(downloadResult.path, "utf-8");

    await expect(fileContent).toMatchSnapshot();

    await expect(await geoPage.historyCount()).toBe(15);
    await expect(page.locator("#history-list .history-header")).toHaveCount(15);
  });

  test("should show manual column mapping for custom csv", async ({ page }) => {
    const geoPage = new GeoConvertPage(page);
    const csvPath = "./examples/custom_sample.csv";

    await geoPage.goto();
    await geoPage.uploadCSV(csvPath);
    await geoPage.selectCoordinateType("WGS84");

    await expect(await geoPage.isManualMappingVisible()).toBe(true);
  });
});
