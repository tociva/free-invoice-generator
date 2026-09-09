import { Invoice, TaxOption } from './invoice-model';

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${path} must be an object.`);
  return value as Record<string, unknown>;
}
function strings(value: Record<string, unknown>, keys: string[], path: string) {
  for (const key of keys)
    if (typeof value[key] !== 'string') throw new Error(`${path}.${key} must be text.`);
}
function numbers(value: Record<string, unknown>, keys: string[], path: string, minimum = 0) {
  for (const key of keys) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < minimum) {
      throw new Error(
        `${path}.${key} must be a finite number${minimum === 0 ? ' of zero or more' : ''}.`,
      );
    }
  }
}
function currency(value: unknown) {
  if (value === null) return;
  const c = record(value, 'currency');
  strings(c, ['code', 'name', 'symbol'], 'currency');
  if (!/^[A-Z]{3}$/.test(String(c['code'])))
    throw new Error('Currency code must have three uppercase letters.');
  numbers(c, ['numericcode'], 'currency');
  if (c['minorunit'] !== null) numbers(c, ['minorunit'], 'currency');
  if (c['fraction'] !== undefined) strings(c, ['fraction'], 'currency');
}
function dateFormat(value: unknown) {
  if (value !== null) strings(record(value, 'dateFormat'), ['name', 'value'], 'dateFormat');
}
export function safeLogo(value: string | null): string {
  return value &&
    (/^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z\d+/=\s]+$/i.test(value) ||
      /^https?:\/\/[^\s<>"']+$/i.test(value) ||
      /^\/(?!\/)[\w/.-]+$/.test(value))
    ? value
    : '';
}

/** Validate before updating either the form or store; JSON dates are restored as Dates. */
export function parseInvoiceJson(text: string): Invoice {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  const value = record(parsed, 'Invoice');
  strings(
    value,
    [
      'invoiceNo',
      'accountNumber',
      'accountName',
      'bankName',
      'terms',
      'notes',
      'deliveryState',
      'grandTotalInWords',
    ],
    'Invoice',
  );
  if (!String(value['invoiceNo']).trim()) throw new Error('Invoice number is required.');
  for (const field of ['invoiceDate', 'invoiceDueDate']) {
    const date = value[field];
    if (date === null) continue;
    if (
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) ||
      !Number.isFinite(Date.parse(date))
    ) {
      throw new Error(`${field} must be a valid ISO date.`);
    }
    const day = date.slice(0, 10);
    if (new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day)
      throw new Error(`${field} is not a calendar date.`);
    value[field] = new Date(date);
  }
  currency(value['currency']);
  dateFormat(value['dateFormat']);
  if (
    value['decimalPlaces'] !== null &&
    (!Number.isInteger(value['decimalPlaces']) ||
      Number(value['decimalPlaces']) < 0 ||
      Number(value['decimalPlaces']) > 5)
  )
    throw new Error('Decimal places must be between 0 and 5.');
  if (
    value['taxOption'] !== null &&
    !Object.values(TaxOption).includes(value['taxOption'] as TaxOption)
  )
    throw new Error('Unknown tax option.');
  for (const field of ['hasItemDescription', 'hasItemDiscount', 'internationalNumbering']) {
    if (typeof value[field] !== 'boolean') throw new Error(`${field} must be true or false.`);
  }
  for (const field of ['organization', 'customer']) {
    if (value[field] === null) continue;
    const party = record(value[field], field);
    strings(
      party,
      [
        'name',
        'address',
        'email',
        'phone',
        'gstin',
        ...(field === 'organization' ? ['authorityName', 'authorityDesignation'] : []),
      ],
      field,
    );
    const country = record(party['country'], `${field}.country`);
    strings(
      country,
      ['code', 'name', 'iso', 'phone', 'currencycode', 'dateformat'],
      `${field}.country`,
    );
    if (country['currency'] !== undefined) currency(country['currency']);
    if (country['dateFormat'] !== undefined) dateFormat(country['dateFormat']);
  }
  if (!Array.isArray(value['items'])) throw new Error('Invoice items must be an array.');
  value['items'].forEach((raw, index) => {
    const item = record(raw, `Item ${index + 1}`);
    strings(item, ['name'], `Item ${index + 1}`);
    if (item['description'] !== null) strings(item, ['description'], `Item ${index + 1}`);
    numbers(
      item,
      [
        'quantity',
        'price',
        'itemTotal',
        'discountAmount',
        'discPercentage',
        'subTotal',
        'tax1Amount',
        'tax1Percentage',
        'tax2Amount',
        'tax2Percentage',
        'tax3Amount',
        'tax3Percentage',
        'taxTotal',
        'grandTotal',
      ],
      `Item ${index + 1}`,
    );
    for (const key of ['discPercentage', 'tax1Percentage', 'tax2Percentage', 'tax3Percentage'])
      if (Number(item[key]) > 100)
        throw new Error(`Item ${index + 1}: ${key} must be at most 100.`);
  });
  numbers(value, ['itemTotal', 'discountTotal', 'subTotal', 'taxTotal', 'grandTotal'], 'Invoice');
  numbers(value, ['roundOff'], 'Invoice', -Infinity);
  for (const field of ['smallLogo', 'largeLogo']) {
    const logo = value[field];
    if (logo !== null && (typeof logo !== 'string' || (logo !== '' && safeLogo(logo) === '')))
      throw new Error(`${field} must be an image URL or a PNG, JPEG, GIF or WebP data URL.`);
  }
  return value as unknown as Invoice;
}
