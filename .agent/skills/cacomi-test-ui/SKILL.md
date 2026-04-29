---
name: cacomi-test-ui
description: >
  Cacomi UI testing patterns with Playwright.
  Trigger: When writing E2E tests for the frontend, creating Page Objects, or validating UI flows in Cacomi.
license: Apache-2.0
metadata:
  author: ant-gravity
  version: "1.0"
  scope: [root, ui]
  auto_invoke: "Writing Playwright E2E tests"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Related Generic Skills

- `playwright` - Generic Playwright patterns (selectors, MCP workflow)
- `cacomi-ui` - UI component structure

## File Structure

```
e2e/                      # Root level e2e folder (Cacomi convention)
├── base-page.ts          # Parent class for ALL pages
├── helpers.ts            # Shared utilities (auth, data gen)
├── auth/                 # Auth feature tests
│   ├── login-page.ts
│   └── login.spec.ts
├── recipes/              # Recipe management tests
│   ├── recipe-page.ts
│   └── recipes.spec.ts
└── planning/             # Meal planning tests
    ├── planner-page.ts
    └── planner.spec.ts
```

## Cacomi Page Object Pattern

### BasePage

```typescript
import { Page, Locator, expect } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState("domcontentloaded");
  }

  // Shared UI components (Header, Footer, Toast)
  async getToastMessage(): Promise<string | null> {
    const toast = this.page.locator('[role="status"]'); // Radix/Sonner toast
    if (await toast.isVisible()) {
      return toast.textContent();
    }
    return null;
  }
}
```

### Feature Page (Example: Recipe)

```typescript
import { BasePage } from "../base-page";
import { Page, Locator, expect } from "@playwright/test";

export class RecipePage extends BasePage {
  readonly createButton: Locator;
  readonly titleInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createButton = page.getByRole("button", { name: "New Recipe" });
    this.titleInput = page.getByLabel("Recipe Title");
    this.saveButton = page.getByRole("button", { name: "Save Recipe" });
  }

  async createRecipe(title: string) {
    await this.createButton.click();
    await this.titleInput.fill(title);
    await this.saveButton.click();
  }
}
```

## Testing Guidelines

### Authentication

Tests that require authentication should use a setup state or helper to bypass manual login for every test, unless testing the login flow itself.

```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

### Data Test IDs

Prefer accessibility roles (`getByRole`, `getByLabel`), but use `data-testid` for elements that are hard to select otherwise (like specific containers or non-interactive elements).

```html
<!-- Component code -->
<div data-testid="recipe-card-123">...</div>
```

```typescript
// Test code
await page.getByTestId("recipe-card-123").click();
```

## Commands

```bash
# Run all E2E tests
npx playwright test

# Run UI mode (interactive)
npx playwright test --ui

# Debug tests
npx playwright test --debug
```

## QA Checklist

- [ ] Page Objects are used (no direct locators in spec files)
- [ ] Tests are independent (clean state)
- [ ] Sensitive data is not hardcoded (use env vars)
- [ ] Happy path AND error states are tested
- [ ] Mobile viewports are considered (if configured)
