import { expect, test } from '@playwright/test';

for (const [route, content] of [
  ['/home', 'app-home'],
  ['/simple-invoice', 'app-simple-invoice'],
  ['/invoice?step=3', 'app-invoice'],
  ['/templates', 'app-list-templates'],
  ['/Testing', 'app-testing'],
]) {
  test(`restores dark mode on direct entry to ${route}`, async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('daybook-theme', '{"darkMode":true}');
    });
    await page.goto(route);
    await expect(page.locator(content)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 18, 32)');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await expect(page.getByRole('button', { name: 'Dark mode', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
}

for (const stored of ['{invalid', '{"darkMode":"true"}', '{"darkMode":null}', 'true']) {
  test(`uses light for invalid preference ${stored}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('daybook-theme', value), stored);
    await page.goto('/home');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(249, 250, 251)');
  });
}

for (const failure of ['getter', 'read', 'write'] as const) {
  test(`theme controls work with a storage ${failure} failure`, async ({ page }) => {
    await page.addInitScript((failure) => {
      const fail = () => {
        throw new DOMException('Storage unavailable', 'SecurityError');
      };
      if (failure === 'getter') Object.defineProperty(window, 'localStorage', { get: fail });
      else Storage.prototype[failure === 'read' ? 'getItem' : 'setItem'] = fail;
    }, failure);
    await page.goto('/home');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    const dark = page.getByRole('button', { name: 'Dark mode', exact: true });
    await dark.focus();
    await dark.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(11, 18, 32)');
    const light = page.getByRole('button', { name: 'Dark mode', exact: true });
    await light.focus();
    await light.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(light).toHaveAttribute('aria-pressed', 'false');
  });
}
