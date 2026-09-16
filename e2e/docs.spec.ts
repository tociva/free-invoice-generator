import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
  for (const darkMode of [false, true]) {
    test(`documentation is responsive at ${width}px in ${darkMode ? 'dark' : 'light'} mode`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((dark) => {
        localStorage.setItem('daybook-theme', JSON.stringify({ darkMode: dark }));
      }, darkMode);

      await page.goto('/docs');

      await expect(page.locator('html')).toHaveAttribute('data-theme', darkMode ? 'dark' : 'light');
      await expect(page.locator('app-docs')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Invoice Generator Help & Documentation' }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.getByRole('link', { name: 'Customize templates' }).click();
      await expect(page).toHaveURL(/\/docs\/customize-templates$/);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await expect(page.getByText('[[invoice_number]]').first()).toBeVisible();

      const itemCode = page.locator('tng-code-block').filter({ hasText: '[[items_start]]' });
      await expect(itemCode).toBeVisible();
      expect(
        await itemCode.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      ).toBe(true);
    });
  }
}

test('legacy documentation URLs redirect to Angular routes', async ({ page }) => {
  await page.goto('/docs/index.html');
  await expect(page).toHaveURL(/\/docs$/);

  await page.goto('/docs/create-unlimited-free-invoices.html');
  await expect(page).toHaveURL(/\/docs\/create-invoices$/);

  await page.goto('/docs/customize-invoice-template.html');
  await expect(page).toHaveURL(/\/docs\/customize-templates$/);

  await page.goto('/docs/free-opensource-invoice-templates/description/rose-quartz.html');
  await expect(page).toHaveURL(/\/docs\/template-library$/);
});

test('documentation template library remains separate from the application catalog', async ({
  page,
}) => {
  await page.goto('/docs/template-library');
  await expect(page.getByRole('heading', { name: 'List of all templates' })).toBeVisible();
  await expect(page).not.toHaveURL(/\/templates$/);

  const firstPageNames = await page.locator('.app-docs-library-card h3').allTextContents();
  expect(firstPageNames).toEqual(
    [...firstPageNames].sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: 'base', numeric: true }),
    ),
  );

  const pagination = page.locator('.app-docs-library-pagination');
  await pagination.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText(/Page 2 of/)).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.getByRole('searchbox', { name: 'Search documentation templates' }).fill('Rose Quartz');
  await page.locator('.app-docs-library-card').click();
  await expect(page).toHaveURL(/\/docs\/template-library\/rose-quartz$/);
  await expect(page.getByRole('heading', { name: 'Rose Quartz' })).toBeVisible();
  await expect(page.getByText(/modern pink-accented color scheme/i)).toBeVisible();
});
