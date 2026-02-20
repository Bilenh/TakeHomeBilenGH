import { Page, expect } from '@playwright/test';

export class LoginPage {
  page: Page;

  // Locators
  private logInLink = "//a[contains(text(), 'Log in')]";
  private acceptAllCookiesButton = "//button[contains(text(), 'Accept All Cookies')]";
  private emailInput = "//input[@placeholder='Email or username']";
  private passwordInput = "//input[@placeholder='Password']";
  private continueButton = "//button[contains(text(), 'Continue')]";

  // URLs from environment variables (e.g. env/prod.env: BASE_URL, LOGIN_URL)
  private mainUrl = process.env.BASE_URL || process.env.MAIN_URL;
  private loginUrl = process.env.LOGIN_URL;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation methods
  async navigateToMainPage() {
    const url = this.mainUrl;
    if (!url) throw new Error('BASE_URL or MAIN_URL must be set.');
    await this.page.goto(url, { timeout: 60000 });
    await this.page.waitForLoadState('load');
  }

  async navigateToLoginPage() {
    const url = this.loginUrl;
    if (!url) throw new Error('LOGIN_URL must be set.');
    await this.page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Waits for the login form to be ready after clicking "Log in". Use this instead of
   * navigateToLoginPage() when you navigated via the link to avoid a second goto that
   * can abort the in-flight navigation (NS_BINDING_ABORTED).
   */
  async waitForLoginPageReady(timeoutMs = 15000) {
    await expect(this.page.getByRole('textbox', { name: 'Email or username' })).toBeVisible({ timeout: timeoutMs });
  }

  // Assertion methods
  async verifyLogInLinkIsVisible() {
    await expect(this.page.getByRole('link', { name: 'Log in' })).toBeVisible({ timeout: 10000 });
  }

  async verifyEmailInputIsVisible() {
    await expect(this.page.getByRole('textbox', { name: 'Email or username' })).toBeVisible({ timeout: 10000 });
  }

  async verifyPasswordInputIsVisible() {
    await expect(this.page.getByRole('textbox', { name: 'Password' })).toBeVisible({ timeout: 10000 });
  }

  async verifyContinueButtonIsVisible() {
    await expect(this.page.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 10000 });
  }

  // Action methods
  /**
   * Clicks "Accept All Cookies" only if the banner/button appears. Does nothing if not visible within the timeout.
   */
  async clickAcceptAllCookiesIfPresent(timeoutMs = 5000) {
    const button = this.page.getByRole('button', { name: 'Accept All Cookies' });
    try {
      await button.waitFor({ state: 'visible', timeout: timeoutMs });
      await button.click();
    } catch {
      // Cookie banner did not appear; continue without failing
    }
  }

  async clickLogInLink() {
    await this.page.getByRole('link', { name: 'Log in' }).click();
  }

  private async delay(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
  }

  /** Human-like typing: click field, clear, then type character-by-character with delay. */
  async fillEmail(email: string, options?: { typingDelayMs?: number }) {
    const locator = this.page.getByRole('textbox', { name: 'Email or username' });
    await locator.click();
    await this.delay(100 + Math.random() * 150);
    await locator.clear();
    await locator.pressSequentially(email, { delay: options?.typingDelayMs ?? 80 });
  }

  async fillPassword(password: string, options?: { typingDelayMs?: number }) {
    if (password === undefined || password === null) {
      throw new Error('fillPassword: password is required (e.g. set TEST_PASSWORD env var).');
    }
    const locator = this.page.getByRole('textbox', { name: 'Password' });
    await locator.click();
    await this.delay(100 + Math.random() * 150);
    await locator.clear();
    await locator.pressSequentially(String(password), { delay: options?.typingDelayMs ?? 80 });
  }

  async clickContinueButton() {
    await this.delay(200 + Math.random() * 400);
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  /**
   * Login with human-like pacing: type character-by-character with delays,
   * and short pauses between email, password, and submit.
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.delay(300 + Math.random() * 500);
    await this.fillPassword(password);
    await this.clickContinueButton();
  }
}
