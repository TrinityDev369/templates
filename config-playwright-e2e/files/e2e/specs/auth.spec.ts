import { test, expect } from '../fixtures/base';
import { LoginPage } from '../pages/login.page';

/**
 * Authentication E2E Tests
 *
 * Covers the core auth flows: login, logout, error handling,
 * and route protection. Uses custom fixtures from base.ts.
 */

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page, testUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // After successful login, user should land on the dashboard
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('invalid credentials shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'BadPassword!');

    // The login page should display an error — user stays on /login
    await loginPage.expectLoginError();
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout returns to login page', async ({ authenticatedPage }) => {
    // authenticatedPage is already logged in via the fixture
    const { DashboardPage } = await import('../pages/dashboard.page');
    const dashboard = new DashboardPage(authenticatedPage);

    // Verify we are on the dashboard first
    await dashboard.goto();
    await dashboard.expectLoaded();

    // Log out
    await dashboard.logout();

    // Should be back on the login page
    await expect(authenticatedPage).toHaveURL(/\/login/);
  });

  test('protected route redirects unauthenticated users to login', async ({
    page,
  }) => {
    // Attempt to visit a protected route without logging in
    await page.goto('/dashboard');

    // The app should redirect to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
