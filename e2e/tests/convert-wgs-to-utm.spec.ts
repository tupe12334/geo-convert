import { test, expect } from "@playwright/test";
import { GeoConvertPage } from "./pageObjects/GeoConvertPage";

test.describe("WGS to UTM conversion", () => {
  test("should convert 32.062289, 34.772015 to 35s e:667272.250 n:3548711.126", async ({
    page,
  }) => {
    const geoPage = new GeoConvertPage(page);
    await geoPage.goto();
    await geoPage.enterWGS("32.062289", "34.772015");
    await geoPage.convertToUTM();

    const { zone, hemisphere, easting, northing } =
      await geoPage.getUTMValues();

    expect(`${zone}${hemisphere.toLowerCase()}`).toBe("36s");
    expect(parseFloat(easting)).toBeCloseTo(667274.762, 2);
    expect(parseFloat(northing)).toBeCloseTo(3548713.386, 3);
  });
});
