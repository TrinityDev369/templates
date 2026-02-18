import { test, expect } from '../fixtures/base';
import { DashboardPage } from '../pages/dashboard.page';

/**
 * Dashboard E2E Tests
 *
 * Uses the `authenticatedPage` fixture so every test starts
 * with a logged-in session — no redundant login steps.
 */

test.describe('Dashboard', () => {
  test('loads with expected layout elements', async ({ authenticatedPage }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.goto();
    await dashboard.expectLoaded();

    // Verify core structural elements are present
    await expect(dashboard.sidebarNav).toBeVisible();
    await expect(dashboard.header).toBeVisible();
    await expect(dashboard.mainContent).toBeVisible();
  });

  test('sidebar navigation between sections works', async ({
    authenticatedPage,
  }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.goto();
    await dashboard.expectLoaded();

    // Navigate to "Settings" via the sidebar
    await dashboard.navigateTo('Settings');
    await dashboard.expectSectionVisible('Settings');

    // Navigate to another section
    await dashboard.navigateTo('Analytics');
    await dashboard.expectSectionVisible('Analytics');
  });

  test('user menu opens and displays profile information', async ({
    authenticatedPage,
    testUser,
  }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await dashboard.goto();
    await dashboard.expectLoaded();

    // Open the user menu dropdown
    await dashboard.openUserMenu();

    // The dropdown should show the current user's name or email
    await expect(dashboard.userMenuDropdown).toContainText(testUser.name);
  });
});
