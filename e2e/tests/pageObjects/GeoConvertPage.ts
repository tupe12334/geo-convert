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

  async downloadCSV(): Promise<{ path: string; filename: string }> {
    // Wait for the CSV download modal to appear
    await this.page.waitForSelector("#confirm-csv-download", { timeout: 5000 });
    
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click("#confirm-csv-download");
    const download = await downloadPromise;
    const path = await download.path();
    
    if (path) {
      return { path, filename: download.suggestedFilename() };
    }
    
    throw new Error('Download failed or path is null');
  }

  async cancelCSVDownload(): Promise<void> {
    await this.page.click("#cancel-csv-download");
  }

  async historyCount(): Promise<number> {
    const count = await this.page.textContent("#history-count");
    return parseInt(count || "0", 10);
  }
}
