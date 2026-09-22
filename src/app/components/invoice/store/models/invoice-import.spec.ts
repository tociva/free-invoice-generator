import { TemplateUtil } from '../../utils/templates.utils';
import { sampleInvoice } from '../../../list-templates/template.utils';
import { DEFAULT_INVOICE_LOGO_URL, initialInvoiceState } from '../invoice.states';
import { createInvoiceJsonEnvelope, parseInvoiceJson } from './invoice-import';

describe('Invoice JSON import and rendering', () => {
  it('starts the default invoice with the existing default logo', () => {
    expect(initialInvoiceState.invoice.smallLogo).toBe(DEFAULT_INVOICE_LOGO_URL);
  });
  it('round-trips an advanced invoice and restores its type, template and dates', () => {
    const imported = parseInvoiceJson(
      JSON.stringify(
        createInvoiceJsonEnvelope(
          'advanced',
          initialInvoiceState.invoice,
          'invoice-templates/test.html',
        ),
      ),
    );
    expect(imported.invoiceType).toBe('advanced');
    expect(imported.templatePath).toBe('invoice-templates/test.html');
    expect(imported.invoice).toEqual(initialInvoiceState.invoice);
    expect(imported.invoice.invoiceDate).toBeInstanceOf(Date);
  });
  it('exports only Simple fields and hydrates a complete Simple form on import', () => {
    const source = structuredClone(initialInvoiceState.invoice);
    source.items[0].discPercentage = 10;
    source.items[0].tax1Percentage = 9;
    source.items[0].tax1Amount = 900;
    source.items[0].grandTotal = 10800;
    source.discountTotal = 1000;
    source.taxTotal = 900;
    source.grandTotal = 29900;
    const envelope = createInvoiceJsonEnvelope('simple', source, 'invoice-templates/simple.html');
    const data = envelope.invoice as Record<string, unknown>;
    const organization = data['organization'] as Record<string, unknown>;
    const item = (data['items'] as Record<string, unknown>[])[0];

    expect(envelope.invoiceType).toBe('simple');
    expect(data).not.toHaveProperty('accountNumber');
    expect(data).not.toHaveProperty('taxOption');
    expect(data).not.toHaveProperty('largeLogo');
    expect(organization).toEqual({
      name: initialInvoiceState.invoice.organization?.name,
      address: initialInvoiceState.invoice.organization?.address,
    });
    expect(item).not.toHaveProperty('discPercentage');
    expect(item).not.toHaveProperty('tax1Percentage');
    expect(data['discountTotal']).toBe(0);
    expect(data['taxTotal']).toBe(0);
    expect(item['grandTotal']).toBe(10000);

    const imported = parseInvoiceJson(JSON.stringify(envelope));
    expect(imported.invoiceType).toBe('simple');
    expect(imported.invoice.taxOption).toBe('Non Taxable');
    expect(imported.invoice.accountNumber).toBe('');
    expect(imported.invoice.largeLogo).toBe('');
    expect(imported.invoice.items[0].grandTotal).toBe(10000);
  });
  it.each(['{', '{}', 'null', '[]'])('rejects malformed or incomplete JSON: %s', (json) => {
    expect(() => parseInvoiceJson(json)).toThrow();
  });
  it('rejects ambiguous legacy exports rather than guessing an invoice type', () => {
    expect(() => parseInvoiceJson(JSON.stringify(initialInvoiceState.invoice))).toThrow(
      /legacy invoice JSON has no invoiceType/,
    );
  });
  it.each([
    { invoiceNo: '' },
    { invoiceDate: '2025-02-30' },
    { invoiceDueDate: 'yesterday' },
    { currency: {} },
    { items: [{ quantity: -1 }] },
    { grandTotal: '30000' },
    { decimalPlaces: 100 },
    { smallLogo: 'javascript:alert(1)' },
    { taxOption: 'unknown' },
  ])('rejects invalid critical fields: %j', (change) => {
    const envelope = createInvoiceJsonEnvelope('advanced', initialInvoiceState.invoice, null);
    expect(() =>
      parseInvoiceJson(
        JSON.stringify({
          ...envelope,
          invoice: { ...(envelope.invoice as object), ...change },
        }),
      ),
    ).toThrow();
  });
  it('recalculates derived item and invoice totals from imported source fields', () => {
    const invoice = structuredClone(initialInvoiceState.invoice);
    invoice.taxOption = 'IGST' as never;
    invoice.items = [
      {
        ...invoice.items[0],
        quantity: 2,
        price: 100,
        discPercentage: 10,
        tax3Percentage: 18,
        itemTotal: 1,
        grandTotal: 1,
      },
    ];
    const imported = parseInvoiceJson(
      JSON.stringify(createInvoiceJsonEnvelope('advanced', invoice, null)),
    ).invoice;

    expect(imported.items[0]).toMatchObject({
      itemTotal: 200,
      discountAmount: 20,
      subTotal: 180,
      tax3Amount: 32.4,
      grandTotal: 212.4,
    });
    expect(imported.grandTotal).toBe(212.4);
  });
  it('renders user text literally without executable markup or replacement-string expansion', () => {
    const invoice = structuredClone(initialInvoiceState.invoice);
    invoice.invoiceNo = '<img src=x onerror=alert(1)> $&';
    invoice.items[0].name = '<script>alert(1)</script>';
    const html = TemplateUtil.fillTemplate(
      '[[invoice_number]][[items_start]]<p>[[item_name]]</p>[[items_end]]',
      invoice,
    );
    expect(html).toContain('&lt;img');
    expect(html).toContain('$&');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
  });
  it('renders IGST, dates and amount using configured invoice formatting', () => {
    const invoice = structuredClone(initialInvoiceState.invoice);
    invoice.items = [{ ...invoice.items[0], tax3Amount: 18 }];
    invoice.dateFormat = { name: 'ISO', value: 'YYYY-MM-DD' };
    expect(
      TemplateUtil.fillTemplate(
        '[[invoice_date]][[items_start]] [[item_igst]][[items_end]]',
        invoice,
      ),
    ).toBe('2025-06-2418.00');
  });
  it('renders valid small and large logos in their template image elements', () => {
    const invoice = structuredClone(initialInvoiceState.invoice);
    invoice.smallLogo = DEFAULT_INVOICE_LOGO_URL;
    invoice.largeLogo = 'data:image/png;base64,YWJj';

    const html = TemplateUtil.fillTemplate(
      '<img class="small" src="[[logo_small_src]]"><img src="[[logo_large_src]]" class="large">',
      invoice,
    );

    expect(html).toContain(`src="${DEFAULT_INVOICE_LOGO_URL}"`);
    expect(html).toContain('src="data:image/png;base64,YWJj"');
  });
  it('removes logo image elements when their corresponding logo is empty', () => {
    const invoice = structuredClone(initialInvoiceState.invoice);
    invoice.smallLogo = '';
    invoice.largeLogo = null;

    const html = TemplateUtil.fillTemplate(
      '<div class="small"><img alt="Logo" src="[[logo_small_src]]"></div><div class="large"><img\n src="[[logo_large_src]]" alt="logo" /></div>',
      invoice,
    );

    expect(html).toBe('<div class="small"></div><div class="large"></div>');
    expect(html).not.toContain('<img');
    expect(html).not.toMatch(/Logo|logo/);
  });
  it('uses the existing default logo in Template List sample previews', () => {
    expect(sampleInvoice.smallLogo).toBe(DEFAULT_INVOICE_LOGO_URL);
    expect(TemplateUtil.fillTemplate('<img src="[[logo_small_src]]">', sampleInvoice)).toContain(
      `src="${DEFAULT_INVOICE_LOGO_URL}"`,
    );
  });
});
