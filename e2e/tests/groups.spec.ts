/**
 * E2E tests: Group creation and sidebar display.
 *
 * Precondition: bunker is running (globalSetup), relay is up (make e2e-up).
 *
 * NOTE: The responsive layout renders GroupManager in multiple sidebar
 * containers. Locators must use .first() to avoid strict mode violations.
 * On mobile, the drawer must be opened before interacting with sidebar.
 */

import { test, expect } from '@playwright/test';
import { authenticateViaBunker } from '../fixtures/auth-helper.js';
import { clearAppState } from '../fixtures/cleanup.js';

function isMobile(page: import('@playwright/test').Page) {
  const vp = page.viewportSize();
  return vp != null && vp.width < 768;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearAppState(page);
  // Authenticate before each test
  await authenticateViaBunker(page);
});

test('create group: name appears in sidebar', async ({ page }) => {
  const GROUP_NAME = 'E2E Test Group';

  // On mobile, open drawer first to access sidebar
  if (isMobile(page)) {
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.waitForTimeout(250);
  }

  // Fill in the group name input in the sidebar — use .first() for duplicate containers
  await page.getByPlaceholder('Group name').first().fill(GROUP_NAME);

  // Click the Create button
  await page.getByRole('button', { name: 'Create', exact: true }).first().click();

  // Group name must appear in the sidebar group list
  const sidebar = page.locator('aside');
  await expect(sidebar.getByText(GROUP_NAME).first()).toBeVisible({ timeout: 30000 });
});

test('leave group: group removed from sidebar after confirmation', async ({ page }) => {
  const GROUP_NAME = 'E2E Leave Group';

  // On mobile, open drawer first
  if (isMobile(page)) {
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.waitForTimeout(250);
  }

  // Create a group
  await page.getByPlaceholder('Group name').first().fill(GROUP_NAME);
  await page.getByRole('button', { name: 'Create', exact: true }).first().click();
  const sidebar = page.locator('aside');
  await expect(sidebar.getByText(GROUP_NAME).first()).toBeVisible({ timeout: 30000 });

  // On mobile, drawer closes after group selection — reopen it
  if (isMobile(page)) {
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.waitForTimeout(250);
  }

  // Click Leave — confirmation dialog should appear
  await page.locator('[data-testid="group-leave-btn"]').first().click();
  await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5000 });

  // Cancel — group should still be in sidebar
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(sidebar.getByText(GROUP_NAME).first()).toBeVisible({ timeout: 5000 });

  // Leave again and confirm
  await page.locator('[data-testid="group-leave-btn"]').first().click();
  await page.locator('[data-testid="group-leave-confirm"]').click();

  // Group should be gone from the sidebar
  await expect(sidebar.getByText(GROUP_NAME).first()).not.toBeVisible({ timeout: 15000 });

  // Board should be deselected (Tasks heading gone)
  await expect(page.getByRole('heading', { name: 'Tasks' })).not.toBeVisible({ timeout: 5000 });
});
