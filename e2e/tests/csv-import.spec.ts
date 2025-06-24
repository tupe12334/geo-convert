import { test, expect } from "@playwright/test";
import { GeoConvertPage } from "./pageObjects/GeoConvertPage";
import path from "path";

test.describe("CSV import", () => {
  test("should process sample csv and add rows to history", async ({ page }) => {
    const geoPage = new GeoConvertPage(page);
    const csvPath = path.resolve(__dirname, "../../geo-convert/examp.csv");

    await geoPage.goto();
    await geoPage.uploadCSV(csvPath);
    await geoPage.confirmCSVImport();
    await geoPage.cancelCSVDownload();

    await expect(await geoPage.historyCount()).toBe(5);
    await expect(page.locator("#history-list .history-header")).toHaveCount(5);

  });
});
