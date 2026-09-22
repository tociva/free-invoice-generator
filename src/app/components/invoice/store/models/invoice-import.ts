import { Invoice, TaxOption } from './invoice-model';
import { CurrencyUtil } from '../currency/currency.util';

export type InvoiceType = 'simple' | 'advanced';

export interface InvoiceJsonEnvelope {
  version: 1;
  invoiceType: InvoiceType;
  templatePath: string | null;
  invoice: unknown;
}

export interface ImportedInvoice {
  invoiceType: InvoiceType;
  templatePath: string | null;
  invoice: Invoice;
}

const emptyCountry = {
  code: '',
  name: '',
  iso: '',
  phone: '',
  currencycode: '',
  dateformat: '',
};

function simpleInvoiceData(invoice: Invoice) {
  const items = invoice.items.map((item) => {
    const itemTotal = item.price * item.quantity;
    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      itemTotal,
      subTotal: itemTotal,
      grandTotal: itemTotal,
    };
  });
  const itemTotal = items.reduce((total, item) => total + item.itemTotal, 0);
  const grandTotal = itemTotal + invoice.roundOff;

  return {
    invoiceNo: invoice.invoiceNo,
    invoiceDate: invoice.invoiceDate,
    invoiceDueDate: invoice.invoiceDueDate,
    currency: invoice.currency,
    decimalPlaces: invoice.decimalPlaces,
    dateFormat: invoice.dateFormat,
    internationalNumbering: invoice.internationalNumbering,
    terms: invoice.terms,
    notes: invoice.notes,
    organization: invoice.organization
      ? { name: invoice.organization.name, address: invoice.organization.address }
      : null,
    customer: invoice.customer
      ? { name: invoice.customer.name, address: invoice.customer.address }
      : null,
    items,
    itemTotal,
    discountTotal: 0,
    subTotal: itemTotal,
    taxTotal: 0,
    roundOff: invoice.roundOff,
    grandTotal,
    grandTotalInWords: CurrencyUtil.numberToWords(
      grandTotal,
      invoice.currency?.code || 'INR',
      invoice.currency?.fraction || '',
      invoice.decimalPlaces ?? 2,
      invoice.internationalNumbering,
    ),
    smallLogo: invoice.smallLogo,
  };
}

export function createInvoiceJsonEnvelope(
  invoiceType: InvoiceType,
  invoice: Invoice,
  templatePath: string | null,
): InvoiceJsonEnvelope {
  return {
    version: 1,
    invoiceType,
    templatePath,
    invoice: invoiceType === 'simple' ? simpleInvoiceData(invoice) : structuredClone(invoice),
  };
}

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

function hydrateSimpleInvoice(raw: unknown): Record<string, unknown> {
  const value = record(raw, 'Invoice');
  const organization =
    value['organization'] === null ? null : record(value['organization'], 'organization');
  const customer = value['customer'] === null ? null : record(value['customer'], 'customer');
  if (!Array.isArray(value['items'])) throw new Error('Invoice items must be an array.');

  return {
    ...value,
    taxOption: TaxOption.NON_TAXABLE,
    hasItemDescription: false,
    hasItemDiscount: false,
    accountNumber: '',
    accountName: '',
    bankName: '',
    deliveryState: '',
    organization:
      organization === null
        ? null
        : {
            name: organization['name'],
            address: organization['address'],
            country: emptyCountry,
            email: '',
            phone: '',
            gstin: '',
            authorityName: '',
            authorityDesignation: '',
          },
    customer:
      customer === null
        ? null
        : {
            name: customer['name'],
            address: customer['address'],
            country: emptyCountry,
            email: '',
            phone: '',
            gstin: '',
          },
    items: value['items'].map((rawItem) => {
      const item = record(rawItem, 'Item');
      return {
        name: item['name'],
        description: null,
        quantity: item['quantity'],
        price: item['price'],
        itemTotal: item['itemTotal'],
        discountAmount: 0,
        discPercentage: 0,
        subTotal: item['subTotal'],
        tax1Amount: 0,
        tax1Percentage: 0,
        tax2Amount: 0,
        tax2Percentage: 0,
        tax3Amount: 0,
        tax3Percentage: 0,
        taxTotal: 0,
        grandTotal: item['grandTotal'],
      };
    }),
    largeLogo: '',
  };
}

function validateInvoice(value: Record<string, unknown>): Invoice {
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

function recalculateInvoice(invoice: Invoice, invoiceType: InvoiceType): Invoice {
  const items = invoice.items.map((item) => {
    const itemTotal = item.price * item.quantity;
    const discountAmount = invoiceType === 'advanced' ? itemTotal * (item.discPercentage / 100) : 0;
    const subTotal = itemTotal - discountAmount;
    const tax1Amount =
      invoiceType === 'advanced' && invoice.taxOption === TaxOption.CGST_SGST
        ? subTotal * (item.tax1Percentage / 100)
        : 0;
    const tax2Amount =
      invoiceType === 'advanced' && invoice.taxOption === TaxOption.CGST_SGST
        ? subTotal * (item.tax2Percentage / 100)
        : 0;
    const tax3Amount =
      invoiceType === 'advanced' && invoice.taxOption === TaxOption.IGST
        ? subTotal * (item.tax3Percentage / 100)
        : 0;
    const taxTotal = tax1Amount + tax2Amount + tax3Amount;

    return {
      ...item,
      itemTotal: Number(itemTotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      subTotal: Number(subTotal.toFixed(2)),
      tax1Amount: Number(tax1Amount.toFixed(2)),
      tax2Amount: Number(tax2Amount.toFixed(2)),
      tax3Amount: Number(tax3Amount.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      grandTotal: Number((subTotal + taxTotal).toFixed(2)),
    };
  });
  const sum = (field: 'itemTotal' | 'discountAmount' | 'subTotal' | 'taxTotal' | 'grandTotal') =>
    items.reduce((total, item) => total + item[field], 0);
  const grandTotal = sum('grandTotal') + invoice.roundOff;

  return {
    ...invoice,
    items,
    itemTotal: sum('itemTotal'),
    discountTotal: sum('discountAmount'),
    subTotal: sum('subTotal'),
    taxTotal: sum('taxTotal'),
    grandTotal,
    grandTotalInWords: CurrencyUtil.numberToWords(
      grandTotal,
      invoice.currency?.code || 'INR',
      invoice.currency?.fraction || '',
      invoice.decimalPlaces ?? 2,
      invoice.internationalNumbering,
    ),
  };
}

/** Validate before updating either the form or store; JSON dates are restored as Dates. */
export function parseInvoiceJson(text: string): ImportedInvoice {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }

  const envelope = record(parsed, 'Invoice file');
  if (!('version' in envelope) && !('invoiceType' in envelope) && !('invoice' in envelope)) {
    throw new Error(
      'This legacy invoice JSON has no invoiceType, so it cannot be safely identified as Simple or Advanced. Re-export it with the current app.',
    );
  }
  if (envelope['version'] !== 1) throw new Error('Unsupported invoice JSON version.');
  if (envelope['invoiceType'] !== 'simple' && envelope['invoiceType'] !== 'advanced') {
    throw new Error('invoiceType must be "simple" or "advanced".');
  }
  const templatePath = envelope['templatePath'];
  if (templatePath !== null && typeof templatePath !== 'string') {
    throw new Error('templatePath must be text or null.');
  }

  const invoiceType = envelope['invoiceType'];
  const invoiceValue =
    invoiceType === 'simple'
      ? hydrateSimpleInvoice(envelope['invoice'])
      : record(envelope['invoice'], 'Invoice');

  return {
    invoiceType,
    templatePath,
    invoice: recalculateInvoice(validateInvoice(invoiceValue), invoiceType),
  };
}
