import { Page, expect } from '@playwright/test';

export class DashboardPage {
  page: Page;

  private homePageUrl = process.env.HOME_PAGE;

  private readonly balancePattern = /[\$€£¥₹]\s*[\d.,]+|[\d.,]+\s*[\$€£¥₹]/;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the home page URL. Use only when you need to open home directly (e.g. from a fresh tab).
   * After login, prefer waitForHomePageReady() since the app already navigates to home.
   */
  async navigateToHomePage() {
    const url = this.homePageUrl;
    if (!url) throw new Error('HOME_PAGE must be set.');
    await this.page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await this.keepSessionAlive();
  }

  /**
   * Waits for the home/dashboard page to be ready after login (no navigation).
   * Uses the portfolio value element (data-testid="portfolio-value") so we target a single element
   * and avoid strict-mode violations from getByText(regex) matching multiple nodes.
   */
  async waitForHomePageReady(timeoutMs = 15000) {
    const container = this.page.getByTestId('portfolio-value');
    await container.waitFor({ state: 'visible', timeout: timeoutMs });
    await expect(container.locator('[role="status"], .sr-only').first()).toHaveText(/^[\d.,]+$/, { timeout: timeoutMs });
    await this.keepSessionAlive();
  }

  /**
   * Verifies that the dashboard portfolio value element shows a value in some currency.
   * Asserts on the element with data-testid="portfolio-value" and its accessible value (sr-only / role=status).
   */
  async verifyPortfolioValuePresent(timeoutMs = 10000) {
    const container = this.page.getByTestId('portfolio-value');
    await expect(container).toBeVisible({ timeout: timeoutMs });
    const value = (await container.locator('[role="status"], .sr-only').first().textContent() ?? '').trim();
    const currency = (await container.locator('xpath=preceding-sibling::*[1]').first().textContent().catch(() => '') ?? '').trim();
    const displayValue = currency && value ? `${currency}${value}` : value || '(empty)';
    expect(value, `Portfolio value should be present (got: ${displayValue})`).toBeTruthy();
    expect(value, `Portfolio value should be numeric (got: ${displayValue})`).toMatch(/^[\d.,]+$/);
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
   * Prefer verifyPortfolioValuePresent() to assert on the dashboard portfolio value element specifically.
   */
  async verifyAnyBalanceVisible() {
    await expect(this.page.getByText(this.balancePattern).first()).toBeVisible();
  }
}
