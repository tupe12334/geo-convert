import { Page } from "@playwright/test";

export class GeoConvertPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async enterWGS(lat: string, lon: string): Promise<void> {
    await this.page.fill("#latitude-input", lat);
    await this.page.fill("#longitude-input", lon);
  }

  async convertToUTM(): Promise<void> {
    await this.page.click("#convert-to-utm");
  }

  async enterConversionTitle(title: string): Promise<void> {
    await this.page.fill("#conversion-title", title);
  }

  async getUTMValues(): Promise<{
    zone: string;
    hemisphere: string;
    easting: string;
    northing: string;
  }> {
    const easting = await this.page.inputValue("#easting-input");
    const northing = await this.page.inputValue("#northing-input");
    const zone = await this.page.inputValue("#zone-input");
    const hemisphere = await this.page.inputValue("#hemisphere-select");
    return { zone, hemisphere, easting, northing };
  }

  async uploadCSV(filePath: string): Promise<void> {
    await this.page.setInputFiles("#csv-file-input", filePath);
  }

  async confirmCSVImport(): Promise<void> {
    await this.page.click("#confirm-csv-import");
  }

  async selectCoordinateType(type: "UTM" | "WGS84"): Promise<void> {
    const selector = `input[name="coordinate-type"][value="${type}"]`;
    await this.page.check(selector);
  }

  async isManualMappingVisible(): Promise<boolean> {
    return this.page.isVisible("#manual-column-mapping");
  }

  async downloadCSV(): Promise<{ path: string; filename: string }> {
    // Wait for the CSV download modal to appear
    await this.page.waitForSelector("#confirm-csv-download", { timeout: 5000 });

    const downloadPromise = this.page.waitForEvent("download");

    await this.page.click("#confirm-csv-download");
    const download = await downloadPromise;

    const path = await download.path();

    if (path) {
      return { path, filename: download.suggestedFilename() };
    }

    throw new Error("Download failed or path is null");
  }

  async cancelCSVDownload(): Promise<void> {
    await this.page.click("#cancel-csv-download");
  }

  async historyCount(): Promise<number> {
    const count = await this.page.textContent("#history-count");
    return parseInt(count || "0", 10);
  }

  async waitForNotificationToHide(): Promise<void> {
    // Wait for any notification toast to appear first
    try {
      await this.page.waitForSelector(".notyf__toast", { timeout: 2000 });
    } catch {
      // If no notification appears, that's fine
      return;
    }

    // Wait for all toasts to have the disappear class or be removed
    await this.page.waitForFunction(
      () => {
        const toasts = document.querySelectorAll(
          ".notyf__toast:not(.notyf__toast--disappear)"
        );
        return toasts.length === 0;
      },
      { timeout: 6000 }
    );
  }
}
