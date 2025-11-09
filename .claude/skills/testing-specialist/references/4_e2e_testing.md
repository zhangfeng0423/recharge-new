# Reference: End-to-End (E2E) Testing

This document provides a template for E2E testing a Next.js application using Playwright.

**Key Idea:** E2E tests simulate a real user's entire journey through your application. They are the highest level of testing and give you confidence that your whole system works together, from the frontend UI to the backend APIs and database.

## E2E Testing with Playwright

### Setup
1.  **Install Playwright:** `npm install --save-dev @playwright/test`
2.  **Install Browsers:** `npx playwright install`
3.  **Configure:** Create a `playwright.config.ts` file. A key part of the configuration is setting the `baseURL` and the `webServer` command to automatically start your Next.js dev server before running tests.

    ```typescript
    // playwright.config.ts
    import { defineConfig, devices } from '@playwright/test';

    export default defineConfig({
      testDir: './e2e',
      fullyParallel: true,
      webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
      use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
      },
      projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      ],
    });
    ```

## E2E Test Template

This example tests a complete user authentication flow: signing up, being redirected, and seeing a welcome message.

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should allow a user to sign up and be redirected to the dashboard', async ({ page }) => {
    // Arrange: Navigate to the signup page
    await page.goto('/signup');

    // Generate a unique email for each test run to avoid conflicts
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    // Act: Fill out the form and submit
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Assert: Check for redirection and the welcome message
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: `Welcome, ${uniqueEmail}` })).toBeVisible();
  });

  test('should show an error message for an existing user', async ({ page }) => {
    // Arrange: This test assumes 'existing@example.com' is already in the database.
    // You might need a seeding script or a previous test to ensure this state.
    await page.goto('/signup');

    // Act
    await page.getByLabel('Email').fill('existing@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Assert
    await expect(page.getByText(/this email is already in use/i)).toBeVisible();
    await expect(page).toHaveURL('/signup'); // Should remain on the signup page
  });

});
```

### Testing Authenticated Routes

To test routes that require a user to be logged in, you can't always log in via the UI as it's slow. A better approach is to programmatically create a session and set the session cookie.

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { createSession } from '../lib/test-session'; // A helper function you would create

test.describe('Dashboard', () => {

  test.beforeEach(async ({ context }) => {
    // Arrange: Create a session for a test user and set the cookie
    const { sessionCookie } = await createSession({ email: 'test@example.com', userId: '123' });
    await context.addCookies([sessionCookie]);
  });

  test('should display the user\'s dashboard data', async ({ page }) => {
    // Act: Navigate directly to the protected route
    await page.goto('/dashboard');

    // Assert: Check that the user's specific data is visible
    await expect(page.getByRole('heading', { name: /welcome, test@example.com/i })).toBeVisible();
    await expect(page.getByText(/your projects/i)).toBeVisible();
  });
});
```
