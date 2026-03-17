/**
 * E2E tests: Group creation and sidebar display.
 *
 * Precondition: bunker is running (globalSetup), relay is up (make e2e-up).
 */

import { test, expect } from '@playwright/test';
import { authenticateViaBunker } from '../fixtures/auth-helper.js';
import { clearAppState } from '../fixtures/cleanup.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearAppState(page);
  // Authenticate before each test
  await authenticateViaBunker(page);
});

test('create group: name appears in sidebar', async ({ page }) => {
  const GROUP_NAME = 'E2E Test Group';

  // Fill in the group name input in the sidebar
  await page.getByPlaceholder('Group name').fill(GROUP_NAME);

  // Click the Create button
  await page.getByRole('button', { name: 'Create' }).click();

  // Group name must appear in the sidebar group list
  const sidebar = page.locator('aside');
  await expect(sidebar.getByText(GROUP_NAME)).toBeVisible({ timeout: 30000 });
});
