import { Page } from '@playwright/test';

export class GeoConvertPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async enterWGS(lat: string, lon: string): Promise<void> {
    await this.page.fill('#latitude-input', lat);
    await this.page.fill('#longitude-input', lon);
  }

  async convertToUTM(): Promise<void> {
    await this.page.click('#convert-to-utm');
  }

  async getUTMValues(): Promise<{ zone: string; hemisphere: string; easting: string; northing: string }>
  {
    const easting = await this.page.inputValue('#easting-input');
    const northing = await this.page.inputValue('#northing-input');
    const zone = await this.page.inputValue('#zone-input');
    const hemisphere = await this.page.inputValue('#hemisphere-select');
    return { zone, hemisphere, easting, northing };
  }

  async getHistoryCount(): Promise<number> {
    const countText = await this.page.textContent('#history-count');
    return parseInt(countText ?? '0', 10);
  }
}
