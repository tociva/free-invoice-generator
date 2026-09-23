import dayjs from 'dayjs';
import { safeLogo } from '../store/models/invoice-import';
import { Invoice } from '../store/models/invoice-model';
import { TemplateItem } from '../store/template/template.model';

export type TemplateRenderMode = 'simple' | 'advanced';

export class TemplateUtil {
  private static readonly simpleSupportedPlaceholders = new Set([
    '[[logo_small_src]]',
    '[[org_name]]',
    '[[org_address]]',
    '[[customer_name]]',
    '[[customer_address]]',
    '[[invoice_number]]',
    '[[invoice_date]]',
    '[[payment_due_date]]',
    '[[items_start]]',
    '[[item_name]]',
    '[[item_quantity]]',
    '[[item_price]]',
    '[[item_amount]]',
    '[[items_end]]',
    '[[itemtotal]]',
    '[[subtotal]]',
    '[[roundoff]]',
    '[[grand_total]]',
    '[[grand_total_inwords]]',
    '[[notes]]',
    '[[terms_and_conditions]]',
    '[[currency_symbol]]',
  ]);

  private static escapeHtml(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (char) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char,
    );
  }

  /**
   * Extracts the [[items_start]] ... [[items_end]] section from a template
   */
  private static extractItemsSection(template: string): string {
    const match = template.match(/\[\[items_start\]\]([\s\S]*?)\[\[items_end\]\]/);
    return match ? match[1].trim() : '';
  }

  /**
   * Replaces a logo placeholder, or removes its image when the invoice has no logo.
   * An empty src can show a broken-image icon, so the image element itself must not
   * survive in the rendered template.
   */
  private static fillLogo(html: string, placeholder: string, logo: string | null): string {
    const value = safeLogo(logo);
    if (value) {
      return html.replaceAll(placeholder, () => this.escapeHtml(value));
    }

    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html
      .replace(new RegExp(`<img\\b[^>]*${escapedPlaceholder}[^>]*>`, 'gi'), '')
      .replaceAll(placeholder, '');
  }

  private static simpleValue(placeholder: string, value: string): string {
    return this.simpleSupportedPlaceholders.has(placeholder) ? value : '';
  }

  private static stripUnsupportedSimplePlaceholders(html: string): string {
    return html.replace(/\[\[[a-zA-Z0-9_]+\]\]/g, (placeholder) =>
      this.simpleSupportedPlaceholders.has(placeholder) ? placeholder : '',
    );
  }

  private static stripSimpleAdvancedContactFields(html: string): string {
    const contactPlaceholder = String.raw`\[\[(?:customer_phone|customer_email|org_phone|org_email)\]\]`;
    const contactIcon = String.raw`(?:\u260e|\u2709|\u{1f4de}|\u{1f4f1}|\u{1f4e7})\ufe0f?`;
    const contactLabel = String.raw`(?:(?:Phone|Mobile|Tel|Email|E-mail|Mail)\s*:?\s*)?`;
    const contactOnlyElementPattern = new RegExp(
      String.raw`^\s*(?:${contactIcon}\s*)?${contactLabel}${contactPlaceholder}\s*$`,
      'iu',
    );

    if (typeof DOMParser === 'undefined') {
      return html.replace(
        new RegExp(
          String.raw`(?:\s*(?:[|,;/-]\s*)?${contactLabel}(?:${contactIcon}\s*)?${contactPlaceholder})+`,
          'giu',
        ),
        '',
      );
    }

    const document = new DOMParser().parseFromString(html, 'text/html');
    const contactIconPattern = /^(?:\s|[\u260e\u2709]|\u{1f4de}|\u{1f4f1}|\u{1f4e7}|\ufe0f)+$/u;

    document.querySelectorAll('span, div, p, li, td').forEach((element) => {
      const text = element.textContent?.trim() ?? '';
      if (!contactOnlyElementPattern.test(text)) {
        return;
      }

      const previous = element.previousElementSibling;
      const next = element.nextElementSibling;

      if (previous && contactIconPattern.test(previous.textContent?.trim() ?? '')) {
        previous.remove();
      }

      if (next && contactIconPattern.test(next.textContent?.trim() ?? '')) {
        next.remove();
      }

      element.remove();
    });

    return document.documentElement.outerHTML.replace(
      new RegExp(
        String.raw`(?:\s*(?:[|,;/-]\s*)?${contactLabel}(?:${contactIcon}\s*)?${contactPlaceholder})+`,
        'giu',
      ),
      '',
    );
  }

  private static stripSimpleAdvancedSections(html: string): string {
    if (typeof DOMParser === 'undefined') {
      return html
        .replace(
          /<([a-z][\w:-]*)\b[^>]*(?:class|id)=["'][^"']*(?:payment-info|bank|account|signature)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi,
          '',
        )
        .replace(
          /<p\b[^>]*>[\s\S]*?(?:A\/C Name|Account Name|Account Number|Bank Name|Bank:)[\s\S]*?<\/p>/gi,
          '',
        );
    }

    const document = new DOMParser().parseFromString(html, 'text/html');
    const advancedOnlySelector = [
      '[class*="payment-info" i]',
      '[id*="payment-info" i]',
      '[class*="payment-method" i]',
      '[id*="payment-method" i]',
      '[class*="payment-title" i]',
      '[id*="payment-title" i]',
      '[class*="bank" i]',
      '[id*="bank" i]',
      '[class*="account" i]',
      '[id*="account" i]',
      '[class*="signature" i]',
      '[id*="signature" i]',
      '[class*="authorized" i]',
      '[id*="authorized" i]',
    ].join(',');

    document.querySelectorAll(advancedOnlySelector).forEach((element) => element.remove());

    document.querySelectorAll('p, li, tr').forEach((element) => {
      const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (/\b(A\/C Name|Account Name|Account Number|Bank Name|Bank:)\b/i.test(text)) {
        element.remove();
      }
    });

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((element) => {
      const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (
        /\b(Payment Info|Payment Method|Payment Methods|Payment Details|Bank Details)\b/i.test(text)
      ) {
        const section = element.closest('div, section, article, aside');
        if (section && section !== document.body && section !== document.documentElement) {
          section.remove();
        } else {
          element.remove();
        }
      }
    });

    return document.documentElement.outerHTML;
  }

  /**
   * Fills an invoice template with actual invoice data
   */
  public static fillTemplate(
    html: string,
    invoice: Invoice,
    mode: TemplateRenderMode = 'advanced',
  ): string {
    const decimal = invoice.decimalPlaces ?? 2;
    const dateFormat = invoice.dateFormat?.value ?? 'DD-MM-YYYY';
    const isSimple = mode === 'simple';

    // Fill items
    const itemRowTemplate = this.extractItemsSection(html);
    const filledItems = invoice.items
      .map((item) =>
        itemRowTemplate
          .replaceAll('[[item_name]]', () => this.escapeHtml(item.name))
          .replaceAll('[[item_quantity]]', item.quantity.toFixed(decimal))
          .replaceAll('[[item_price]]', item.price.toFixed(decimal))
          .replaceAll('[[item_cgst]]', isSimple ? '' : (item.tax1Amount ?? 0).toFixed(decimal))
          .replaceAll('[[item_igst]]', isSimple ? '' : (item.tax3Amount ?? 0).toFixed(decimal))
          .replaceAll('[[item_sgst]]', isSimple ? '' : (item.tax2Amount ?? 0).toFixed(decimal))
          .replaceAll('[[item_amount]]', item.grandTotal.toFixed(decimal)),
      )
      .join('');

    const itemsRegex = /\[\[items_start\]\][\s\S]*?\[\[items_end\]\]/;
    let result = html.replace(itemsRegex, () => filledItems);
    result = this.fillLogo(result, '[[logo_small_src]]', invoice.smallLogo);
    result = this.fillLogo(result, '[[logo_large_src]]', isSimple ? '' : invoice.largeLogo);

    // Replace other placeholders
    const replacements: Record<string, string> = {
      '[[invoice_number]]': invoice.invoiceNo ?? '',
      '[[invoice_date]]': invoice.invoiceDate ? dayjs(invoice.invoiceDate).format(dateFormat) : '',
      '[[payment_due_date]]': invoice.invoiceDueDate
        ? dayjs(invoice.invoiceDueDate).format(dateFormat)
        : '',
      '[[customer_name]]': invoice.customer?.name ?? '',
      '[[customer_address]]': invoice.customer?.address ?? '',
      '[[customer_phone]]': invoice.customer?.phone ?? '',
      '[[customer_email]]': invoice.customer?.email ?? '',
      '[[org_authority_name]]': invoice.organization?.authorityName ?? '',
      '[[org_authority_designation]]': invoice.organization?.authorityDesignation ?? '',
      '[[org_name]]': invoice.organization?.name ?? '',
      '[[org_address]]': invoice.organization?.address ?? '',
      '[[org_phone]]': invoice.organization?.phone ?? '',
      '[[org_email]]': invoice.organization?.email ?? '',
      '[[currency_symbol]]': invoice.currency?.symbol ?? '',
      '[[itemtotal]]': invoice.itemTotal.toFixed(decimal),
      '[[discount]]': invoice.discountTotal.toFixed(decimal),
      '[[subtotal]]': invoice.subTotal.toFixed(decimal),
      '[[tax_amount]]': invoice.taxTotal.toFixed(decimal),
      '[[roundoff]]': invoice.roundOff.toFixed(decimal),
      '[[grand_total]]': invoice.grandTotal.toFixed(decimal),
      '[[grand_total_inwords]]': invoice.grandTotalInWords ?? '',
      '[[account_number]]': invoice.accountNumber ?? '',
      '[[account_name]]': invoice.accountName ?? '',
      '[[bank_name]]': invoice.bankName ?? '',
      '[[terms_and_conditions]]': invoice.terms ?? '',
      '[[notes]]': invoice.notes ?? '',
    };

    // Replace all placeholders
    if (isSimple) {
      result = this.stripSimpleAdvancedContactFields(result);
    }

    for (const [placeholder, value] of Object.entries(replacements)) {
      const renderValue = isSimple ? this.simpleValue(placeholder, value) : value;
      result = result.replaceAll(placeholder, () => this.escapeHtml(renderValue));
    }

    if (isSimple) {
      result = this.stripSimpleAdvancedSections(result);
      result = this.stripUnsupportedSimplePlaceholders(result);
    }

    return result;
  }

  /**
   * Download a TemplateItem as PDF
   */
  public static async downloadTemplateAsPDF(item: TemplateItem): Promise<void> {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const container = document.createElement('div');
    container.innerHTML = item.html ?? '';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.background = 'white';
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    html2canvas(container, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 1) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${item.name}.pdf`);
        document.body.removeChild(container);
      })
      .catch((err) => {
        console.error('Error generating PDF:', err);
        document.body.removeChild(container);
      });
  }

  /**
   * Download a TemplateItem as HTML
   */
  public static async downloadTemplateAsHTML(item: TemplateItem): Promise<void> {
    let html = item.html ?? '';
    // App-relative images cannot resolve when the download is opened via file://.
    // Embed them without changing template markup or already embedded uploads.
    const images = [...html.matchAll(/<img\b[^>]*\ssrc\s*=\s*(["'])(\/[^"']*)\1[^>]*>/gi)];
    const embedded = new Map<string, string>();
    for (const match of images) {
      const src = match[2];
      if (!safeLogo(src) || src.startsWith('//')) continue;
      let dataUrl = embedded.get(src);
      if (!dataUrl) {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`Unable to load invoice image: ${response.status}`);
        const image = await response.blob();
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(image);
        });
        embedded.set(src, dataUrl);
      }
      html = html.replace(match[0], () =>
        match[0].replace(`${match[1]}${src}${match[1]}`, () => `${match[1]}${dataUrl}${match[1]}`),
      );
    }
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.template.html`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
