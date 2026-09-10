import { expect, test } from '@playwright/test';

test('manual theme persists without resetting forms or following the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/simple-invoice');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Dark mode', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.locator('app-header tng-icon svg')).toBeVisible();
  await page.getByLabel('Invoice Number', { exact: true }).fill('THEME-42');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Dark mode', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByLabel('Invoice Number', { exact: true })).toHaveValue('THEME-42');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Dark mode', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

for (const width of [390, 768, 1280]) {
  for (const mode of ['light', 'dark'] as const) {
    test(`semantic layouts at ${width}px in ${mode} mode`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
      await page.addInitScript((darkMode) => {
        localStorage.setItem('daybook-theme', JSON.stringify({ darkMode }));
      }, mode === 'dark');
      for (const [name, route, content] of [
        ['home', '/home', 'app-home'],
        ['editor', '/simple-invoice', 'app-simple-invoice'],
        ['catalog', '/templates', 'app-list-templates'],
        ['advanced', '/invoice?step=3', 'app-invoice'],
        ['preview', '/simple-invoice?step=3', 'app-preview-invoice'],
      ]) {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
        await expect(page.locator(content)).toBeVisible();
        if (name === 'editor') {
          await expect(page.getByLabel('Invoice Number', { exact: true })).toBeVisible();
        }
        if (name === 'catalog')
          await expect(page.locator('app-list-templates iframe').first()).toBeVisible();
        if (name === 'preview') {
          await expect(
            page.frameLocator('app-preview-invoice iframe').locator('body'),
          ).toContainText('INV-0001');
          const preview = page.locator('app-preview-invoice');
          for (const button of await preview.getByRole('button').all()) {
            const bounds = await button.boundingBox();
            expect(bounds).not.toBeNull();
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
          }
          await expect
            .poll(async () =>
              preview
                .locator('.app-preview-paper')
                .evaluate((e) => e.getBoundingClientRect().width),
            )
            .toBeLessThan(width);
        }
        if (name === 'home') {
          const foreground = await page
            .locator('app-home button')
            .evaluate((e) => getComputedStyle(e).color);
          expect(foreground).toBe(mode === 'dark' ? 'rgb(11, 18, 32)' : 'rgb(255, 255, 255)');
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
        const colors = await page.evaluate(() => {
          const body = getComputedStyle(document.body);
          const root = getComputedStyle(document.documentElement);
          return {
            background: body.backgroundColor,
            token: root.getPropertyValue('--tng-semantic-background-base').trim(),
          };
        });
        expect(colors.token).toBe(mode === 'dark' ? '#0b1220' : '#f9fafb');
        expect(colors.background).toBe(mode === 'dark' ? 'rgb(11, 18, 32)' : 'rgb(249, 250, 251)');
        await page.screenshot({
          path: testInfo.outputPath(`${name}-${mode}-${width}.png`),
          fullPage: true,
        });
      }
    });
  }
}

test('empty and validation error compositions remain usable', async ({ page }) => {
  await page.goto('/templates');
  await expect(page.locator('app-list-templates iframe').first()).toBeVisible();
  await page.getByRole('textbox', { name: 'Search templates' }).fill('no-template-matches-this');
  await expect(page.getByRole('heading', { name: 'No matching templates' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).last().click();
  await expect(page.locator('app-list-templates iframe').first()).toBeVisible();
  await page.goto('/simple-invoice');
  const invoice = page.getByLabel('Invoice Number', { exact: true });
  await invoice.fill('');
  await invoice.press('Tab');
  await expect(page.getByRole('alert')).toContainText('Invoice number is required');
  await expect(invoice).toHaveAttribute('aria-invalid', 'true');
});

test('file upload is keyboard accessible', async ({ page }) => {
  await page.goto('/home');
  const upload = page.locator('[appFileSelect]');
  await upload.focus();
  await expect(upload).toBeFocused();
  const chooser = page.waitForEvent('filechooser');
  await upload.press('Enter');
  await chooser;
});

test('catalog loading, failure and retry use shared states', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let fail = true;
  await page.route('**/invoice-templates/templates.json', async (route) => {
    if (fail) {
      await pending;
      await route.fulfill({ status: 503, body: 'Unavailable' });
    } else {
      await route.continue();
    }
  });
  await page.goto('/templates');
  await expect(page.getByRole('status')).toContainText('Loading templates');
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('status')).toBeHidden();
  fail = false;
  await page.getByRole('button', { name: 'Retry templates' }).click();
  await expect(page.locator('app-list-templates iframe').first()).toBeVisible();
  await expect(page.getByRole('alert')).toBeHidden();
});
