import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('simple invoice: edit, select, preview, export, refresh and history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/simple-invoice?step=1');
  await page.getByLabel('Invoice Number', { exact: true }).fill('REGRESSION-42');
  await page.getByRole('button', { name: 'Select Template', exact: true }).click();
  await expect(page).toHaveURL(/step=2/);
  await expect(page.locator('app-select-template iframe').first()).toBeVisible();
  await page.getByRole('button', { name: 'Preview and Download', exact: true }).click();
  await expect(page).toHaveURL(/step=3/);
  const preview = page.frameLocator('app-preview-invoice iframe');
  await expect(preview.locator('body')).toContainText('REGRESSION-42');
  for (const name of ['HTML', 'JSON', 'PDF']) {
    const download = page.waitForEvent('download', { timeout: 30000 });
    await page
      .locator('app-preview-invoice')
      .getByRole('button', { name, exact: name !== 'JSON' })
      .click();
    const result = await download;
    expect(result.suggestedFilename()).toMatch(new RegExp(`\\.${name.toLowerCase()}$`));
    expect(await result.failure()).toBeNull();
    const content = await readFile((await result.path())!);
    if (name === 'HTML' || name === 'JSON') expect(content.toString()).toContain('REGRESSION-42');
    if (name === 'PDF') expect(content.subarray(0, 5).toString()).toBe('%PDF-');
  }
  await page.goBack();
  await expect(page).toHaveURL(/step=2/);
  await page.goForward();
  await expect(page).toHaveURL(/step=3/);
  await page.reload();
  await expect(page.locator('app-preview-invoice iframe')).toBeVisible();
  expect(errors).toEqual([]);
});

test('advanced invoice restores steps and edits discounted items', async ({ page }) => {
  await page.goto('/invoice?step=3');
  await page
    .locator('tng-checkbox')
    .filter({ hasText: 'Show Item Discount' })
    .locator('input')
    .check();
  await page.getByRole('button', { name: 'Next', exact: true }).last().click();
  await expect(page).toHaveURL(/step=4/);
  await page.getByRole('button', { name: 'Add Item', exact: true }).click();
  const row = page.locator('app-invoice-items tbody tr').last();
  await expect(row.locator('[formControlName="price"]')).toHaveClass(/ng-pristine/);
  await expect(row.locator('[formControlName="price"]')).toHaveValue('0');
  await row.locator('[formControlName="price"]').fill('100');
  await row.locator('[formControlName="quantity"]').fill('2');
  await row.locator('[formControlName="discPercentage"]').fill('10');
  await row.locator('[formControlName="discPercentage"]').press('Tab');
  await expect(row.locator('[formControlName="subTotal"]')).toHaveValue('180');
  await page.reload();
  await expect(page.locator('app-invoice-items')).toBeVisible();
});

for (const width of [390, 768, 1280]) {
  test(`editor responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/simple-invoice?step=1');
    await expect(page.getByLabel('Invoice Number', { exact: true })).toBeVisible();
    const editor = width <= 768 ? 'app-invoice-items-mobile' : 'app-invoice-items';
    await expect(
      page.locator(editor).getByRole('button', { name: 'Add Item', exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
  });
}

test('catalog dialog closes on Escape and restores focus', async ({ page }) => {
  await page.goto('/templates');
  const preview = page
    .locator('app-list-templates')
    .getByRole('button', { name: /preview/i })
    .first();
  await preview.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(preview).toBeFocused();
});

test('JSON import validates failures and updates an already initialized editor', async ({
  page,
}) => {
  await page.goto('/simple-invoice?step=3');
  const downloaded = page.waitForEvent('download');
  await page.locator('app-preview-invoice').getByRole('button', { name: /JSON/ }).click();
  const json = JSON.parse(await readFile((await (await downloaded).path())!, 'utf8'));
  json.invoiceNo = 'IMPORTED-99';
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"invoiceNo":"bad"}'),
  });
  await expect(page.getByRole('alert')).toContainText('must be');
  await expect(page).toHaveURL(/home/);
  await page.locator('input[type=file]').setInputFiles({
    name: 'invoice.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(json)),
  });
  await expect(page.getByLabel('Invoice Number', { exact: true })).toHaveValue('IMPORTED-99');
  await page.getByRole('button', { name: 'Preview and Download', exact: true }).click();
  await expect(page.frameLocator('app-preview-invoice iframe').locator('body')).toContainText(
    'IMPORTED-99',
  );
});

test('TailNG currency select supports keyboard selection and updates invoice currency', async ({
  page,
}) => {
  await page.goto('/simple-invoice');
  const currency = page.locator('app-simple-invoice-config app-tailng-select').first();
  await currency.getByRole('combobox').click();
  await expect(page.getByRole('option').first()).toBeVisible();
  await currency.getByRole('combobox').press('Home');
  await expect(page.getByRole('option').first()).toHaveAttribute('data-active', '');
  await currency.getByRole('combobox').press('Enter');
  await expect(page.locator('app-invoice-summary')).toContainText('AFN Thirty Thousand');
  await currency.getByRole('combobox').click();
  await page.getByRole('option', { name: /US Dollar/, exact: false }).click();
  await expect(currency).toContainText('US Dollar');
  await expect(page.locator('app-invoice-summary')).toContainText('USD Thirty Thousand');
});
