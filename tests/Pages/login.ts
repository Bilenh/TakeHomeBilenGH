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
  async clickAcceptAllCookies() {
    await this.page.getByRole('button', { name: 'Accept All Cookies' }).click();
  }

  async clickLogInLink() {
    await this.page.getByRole('link', { name: 'Log in' }).click();
  }

  async fillEmail(email: string) {
    await this.page.getByRole('textbox', { name: 'Email or username' }).fill(email);
  }

  async fillPassword(password: string) {
    if (password === undefined || password === null) {
      throw new Error('fillPassword: password is required (e.g. set TEST_PASSWORD env var).');
    }
    await this.page.getByRole('textbox', { name: 'Password' }).fill(String(password));
  }

  async clickContinueButton() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  // Combined action method for login
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickContinueButton();
  }
}
