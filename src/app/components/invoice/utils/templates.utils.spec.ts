import { sampleInvoice } from '../../list-templates/template.utils';
import { TemplateUtil } from './templates.utils';

describe('TemplateUtil', () => {
  const templateHtml = `
    <section>
      <p>Invoice: [[invoice_number]]</p>
      <p>Customer: [[customer_name]] / [[customer_email]] / [[customer_phone]]</p>
      <p>Organization: [[org_name]] / [[org_email]] / [[org_phone]]</p>
      <p>\u{1f4de} [[customer_phone]] \u2709\ufe0f [[customer_email]] \u{1f4cd} [[customer_address]]</p>
      <div class="contact-line">
        <div class="contact-icon">\u{1f4de}</div>
        <span>[[org_phone]]</span>
      </div>
      <div class="contact-line">
        <div class="contact-icon">\u2709</div>
        <span>[[org_email]]</span>
      </div>
      <p>Bank: [[account_name]] / [[account_number]] / [[bank_name]]</p>
      <div class="payment-info">
        <h3>Payment Info</h3>
        <p><strong>Account Name:</strong> [[account_name]]</p>
        <p><strong>Account Number:</strong> [[account_number]]</p>
        <p><strong>Bank Name:</strong> [[bank_name]]</p>
      </div>
      <div class="payment-method">
        <h3>Payment Method:</h3>
        <div class="payment-details">
          <p><strong>Bank:</strong> [[bank_name]]</p>
          <p><strong>A/C Name:</strong> [[org_name]]</p>
        </div>
      </div>
      <div class="signature-section">
        <h4>[[org_authority_name]]</h4>
        <p>Authorized Signature</p>
      </div>
      <p>Totals: [[itemtotal]] / [[discount]] / [[tax_amount]] / [[grand_total]]</p>
      <p>Unknown advanced token: [[bank_ifsc]]</p>
      <table>
        <tbody>
          [[items_start]]
          <tr>
            <td>[[item_name]]</td>
            <td>[[item_cgst]]</td>
            <td>[[item_sgst]]</td>
            <td>[[item_igst]]</td>
            <td>[[item_amount]]</td>
          </tr>
          [[items_end]]
        </tbody>
      </table>
    </section>
  `;

  it('removes advanced-only placeholders and values when rendering simple invoices', () => {
    const rendered = TemplateUtil.fillTemplate(templateHtml, sampleInvoice, 'simple');

    expect(rendered).toContain('INV-1');
    expect(rendered).toContain('Tom Technologies');
    expect(rendered).toContain('Stringhills Labs');
    expect(rendered).toContain('Web Development');
    expect(rendered).toContain('10000.00');

    expect(rendered).not.toContain('tomtechnologies@gmail.com');
    expect(rendered).not.toContain('1234567890');
    expect(rendered).not.toContain('stringlabs@string.com');
    expect(rendered).not.toContain('2255225522');
    expect(rendered).not.toContain('Joeh Doe');
    expect(rendered).not.toContain('225522552255');
    expect(rendered).not.toContain('Bank Of Stringhills');
    expect(rendered).not.toContain('Payment Info');
    expect(rendered).not.toContain('Payment Method');
    expect(rendered).not.toContain('Account Name:');
    expect(rendered).not.toContain('Account Number:');
    expect(rendered).not.toContain('Bank Name:');
    expect(rendered).not.toContain('A/C Name:');
    expect(rendered).not.toContain('Authorized Signature');
    expect(rendered).not.toContain('\u{1f4de}');
    expect(rendered).not.toContain('\u2709');
    expect(rendered).toContain('\u{1f4cd} Tom towers,tom valley');
    expect(rendered).not.toMatch(/\[\[[a-zA-Z0-9_]+\]\]/);
  });

  it('keeps advanced placeholders populated when rendering advanced invoices', () => {
    const rendered = TemplateUtil.fillTemplate(templateHtml, sampleInvoice, 'advanced');

    expect(rendered).toContain('tomtechnologies@gmail.com');
    expect(rendered).toContain('1234567890');
    expect(rendered).toContain('stringlabs@string.com');
    expect(rendered).toContain('2255225522');
    expect(rendered).toContain('Joeh Doe');
    expect(rendered).toContain('225522552255');
    expect(rendered).toContain('Bank Of Stringhills');
  });
});
