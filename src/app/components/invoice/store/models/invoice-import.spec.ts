import { TemplateUtil } from '../../utils/templates.utils';
import { initialInvoiceState } from '../invoice.states';
import { parseInvoiceJson } from './invoice-import';

describe('Invoice JSON import and rendering', () => {
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
});
