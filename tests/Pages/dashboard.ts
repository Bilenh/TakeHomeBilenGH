import { Page, expect } from '@playwright/test';

export class DashboardPage {
  page: Page;

  private homePageUrl = process.env.HOME_PAGE;

  private readonly balancePattern = /[\$€£¥₹]\s*[\d.,]+|[\d.,]+\s*[\$€£¥₹]/;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToHomePage() {
    const url = this.homePageUrl;
    if (!url) throw new Error('HOME_PAGE must be set.');
    await this.page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await this.keepSessionAlive();
  }

  /**
   * Performs a harmless click on the page to signal user activity and reduce session expiry during slow loads.
   */
  async keepSessionAlive() {
    try {
      await this.page.locator('body').click({ position: { x: 10, y: 10 }, timeout: 3000 });
    } catch {
      // Ignore if body not ready
    }
  }

  /**
   * Clicks "Maybe later" only if the pop-up appears during/after navigation.
   * Does nothing if the button is not visible within the timeout.
   */
  async clickMaybeLaterIfPresent(timeoutMs = 5000) {
    const button = this.page.getByRole('button', { name: 'Maybe later' });
    try {
      await button.waitFor({ state: 'visible', timeout: timeoutMs });
      await button.click();
    } catch {
      // Pop-up did not appear; continue without failing
    }
  }

  /**
   * Verifies that a balance amount is visible. Use this for any currency and any value
   * (e.g. '€375.', '$1,234.56', '£99.00'). Pass the exact text as shown on the page.
   */
  async verifyBalanceVisible(balanceText: string, timeoutMs = 15000) {
    await expect(this.page.getByText(balanceText)).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Verifies that some balance (any currency symbol + amount) is visible,
   * when the exact value is not known. Matches common formats like €375., $100, £50.00.
   */
  async verifyAnyBalanceVisible() {
    await expect(this.page.getByText(this.balancePattern)).toBeVisible();
  }
}
