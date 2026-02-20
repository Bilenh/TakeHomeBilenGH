import { test } from '@playwright/test';
import { LoginPage } from './Pages/login';
import { DashboardPage } from './Pages/dashboard';

test('test', async ({ page }) => {
  test.setTimeout(90000); // External navigation + login can be slow; default 30s is too low
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.navigateToMainPage();
  await loginPage.verifyLogInLinkIsVisible();
  await loginPage.clickAcceptAllCookiesIfPresent();
  await loginPage.clickLogInLink();
  await loginPage.waitForLoginPageReady();

  await loginPage.verifyEmailInputIsVisible();
  await loginPage.verifyPasswordInputIsVisible();
  await loginPage.verifyContinueButtonIsVisible();

  const email = process.env.VALID_EMAIL;
  const password = process.env.VALID_PASSWORD;
  if (!email || !password) {
    test.skip(true, 'VALID_EMAIL and VALID_PASSWORD must be set (e.g. in env/prod.env).');
    return;
  }
  await loginPage.login(email, password);

  await dashboardPage.navigateToHomePage();
  await dashboardPage.clickMaybeLaterIfPresent();

  await dashboardPage.keepSessionAlive();

  await dashboardPage.verifyAnyBalanceVisible();
});
