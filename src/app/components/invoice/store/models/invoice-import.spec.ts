import { TemplateUtil } from '../../utils/templates.utils';
import { sampleInvoice } from '../../../list-templates/template.utils';
import { DEFAULT_INVOICE_LOGO_URL, initialInvoiceState } from '../invoice.states';
import { parseInvoiceJson } from './invoice-import';

describe('Invoice JSON import and rendering', () => {
  it('starts the default invoice with the existing default logo', () => {
    expect(initialInvoiceState.invoice.smallLogo).toBe(DEFAULT_INVOICE_LOGO_URL);
  });
  it('round-trips the current JSON export format and restores dates', () => {
    const invoice = parseInvoiceJson(JSON.stringify(initialInvoiceState.invoice));
    expect(invoice).toEqual(initialInvoiceState.invoice);
    expect(invoice.invoiceDate).toBeInstanceOf(Date);
  });
  it.each(['{', '{}', 'null', '[]'])('rejects malformed or incomplete JSON: %s', (json) => {
    expect(() => parseInvoiceJson(json)).toThrow();
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
    expect(() =>
      parseInvoiceJson(JSON.stringify({ ...initialInvoiceState.invoice, ...change })),
    ).toThrow();
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
