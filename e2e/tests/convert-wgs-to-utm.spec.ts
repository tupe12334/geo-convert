import { test, expect } from "@playwright/test";
import { GeoConvertPage } from "./pageObjects/GeoConvertPage";

test.describe("WGS to UTM conversion", () => {
  test("should convert 32.062289, 34.772015 to 35s e:667274.762 n:3548713.386", async ({
    page,
  }) => {
    const geoPage = new GeoConvertPage(page);
    await geoPage.goto();

    // Screenshot: Initial state of the application
    await expect(page).toHaveScreenshot("wgs-to-utm-initial-state.png");

    await geoPage.enterWGS("32.062289", "34.772015");

    // Screenshot: After entering WGS coordinates
    await expect(page).toHaveScreenshot("wgs-to-utm-coordinates-entered.png");

    await geoPage.convertToUTM();

    const { zone, hemisphere, easting, northing } =
      await geoPage.getUTMValues();

    expect(`${zone}${hemisphere.toLowerCase()}`).toBe("36n");
    expect(parseFloat(easting)).toBeCloseTo(667274.762, 2);
    expect(parseFloat(northing)).toBeCloseTo(3548713.386, 2);

    const historyCount = await geoPage.historyCount();
    expect(historyCount).toBeGreaterThan(0);

    // Screenshot: After conversion with results displayed (mask timestamps to ignore date changes)
    await expect(page).toHaveScreenshot("wgs-to-utm-conversion-complete.png", {
      mask: [page.locator(".history-time")],
    });
  });

  test("should display proper formatting in conversion history", async ({
    page,
  }) => {
    const geoPage = new GeoConvertPage(page);
    await geoPage.goto();

    // Enter multiple conversions for history testing
    await geoPage.enterWGS("32.062289", "34.772015");
    await geoPage.enterConversionTitle("Tel Aviv Coordinates");
    await geoPage.convertToUTM();

    // Add second conversion
    await geoPage.enterWGS("31.7767", "35.2345");
    await geoPage.enterConversionTitle("Jerusalem - Western Wall");
    await geoPage.convertToUTM();

    // Screenshot: History with multiple conversions (mask timestamps to ignore date changes)
    await expect(page).toHaveScreenshot(
      "wgs-to-utm-history-with-proper-formatting.png",
      {
        mask: [page.locator(".history-time")],
      }
    );

    const historyCount = await geoPage.historyCount();
    expect(historyCount).toBeGreaterThanOrEqual(2);
  });
});
