import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import { Invoice } from '../store/models/invoice-model';
import { TemplateItem } from '../store/template/template.model';

export class TemplateUtil {

  /**
   * Extracts the [[items_start]] ... [[items_end]] section from a template
   */
  private static extractItemsSection(template: string): string {
    const match = template.match(/\[\[items_start\]\]([\s\S]*?)\[\[items_end\]\]/);
    return match ? match[1].trim() : '';
  }

  /**
   * Fills an invoice template with actual invoice data
   */
  public static fillTemplate(html: string, invoice: Invoice): string {
    const decimal = invoice.decimalPlaces ?? 2;
    const dateFormat = invoice.dateFormat?.value ?? 'DD-MM-YYYY';

    // Fill items
    const itemRowTemplate = this.extractItemsSection(html);
    const filledItems = invoice.items.map(item =>
      itemRowTemplate
        .replaceAll('[[item_name]]', item.name)
        .replaceAll('[[item_quantity]]', item.quantity.toFixed(decimal))
        .replaceAll('[[item_price]]', item.price.toFixed(decimal))
        .replaceAll('[[item_cgst]]', (item.tax1Amount ?? 0).toFixed(decimal))
        .replaceAll('[[item_sgst]]', (item.tax2Amount ?? 0).toFixed(decimal))
        .replaceAll('[[item_amount]]', item.grandTotal.toFixed(decimal))
    ).join('');

    const itemsRegex = /\[\[items_start\]\][\s\S]*?\[\[items_end\]\]/;
    let result = html.replace(itemsRegex, filledItems);

    // Replace other placeholders
    const replacements: Record<string, string> = {
      '[[invoice_number]]': invoice.invoiceNo ?? '',
      '[[invoice_date]]': invoice.invoiceDate ? dayjs(invoice.invoiceDate).format(dateFormat) : '',
      '[[payment_due_date]]': invoice.invoiceDueDate ? dayjs(invoice.invoiceDueDate).format(dateFormat) : '',
      '[[customer_name]]': invoice.customer?.name ?? '',
      '[[customer_address]]': invoice.customer?.address ?? '',
      '[[customer_phone]]': invoice.customer?.phone ?? '',
      '[[customer_email]]': invoice.customer?.email ?? '',
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
      '[[logo_small_src]]': invoice.smallLogo ?? '',
      '[[logo_large_src]]': invoice.largeLogo ?? '',
      '[[account_number]]': invoice.accountNumber ?? '',
      '[[account_name]]': invoice.accountName ?? '',
      '[[bank_name]]': invoice.bankName ?? '',
      '[[terms_and_conditions]]': invoice.terms ?? '',
      '[[notes]]': invoice.notes ?? ''
    };

    // Replace all placeholders
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replaceAll(placeholder, value);
    }

    return result;
  }

  /**
   * Download a TemplateItem as PDF
   */
  public static downloadTemplateAsPDF(item: TemplateItem): void {
    const container = document.createElement('div');
    container.innerHTML = item.html;
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
  public static downloadTemplateAsHTML(item: TemplateItem): void {
    const blob = new Blob([item.template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.template.html`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
