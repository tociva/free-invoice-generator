import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TemplateItem } from '../templates/store/model/template.model';
import { Invoice } from '../invoice/store/model/invoice.model';
import dayjs from 'dayjs';

export class TemplateUtil {
  
  private static extractItemsSection = (template: string): string => {
    const match = template.match(/\[\[items_start\]\]([\s\S]*?)\[\[items_end\]\]/);
    return match ? match[1].trim() : '';
  };

  public static fillTemplate(html: string, invoice: Invoice): string {
    const decimal = invoice.currency.decimal;
    const dateFormat = invoice.dateFormat.value;
    const itemRowTemplate = this.extractItemsSection(html);
    const filledItems = invoice.items.map((item) =>
      itemRowTemplate
        .replaceAll('[[item_name]]', item.name)
        .replaceAll('[[item_quantity]]', item.quantity.toString())
        .replaceAll('[[item_price]]', item.price.toFixed(decimal))
        .replaceAll('[[item_cgst]]', item.tax1Amount.toFixed(decimal))
        .replaceAll('[[item_sgst]]', item.tax2Amount.toFixed(decimal))
        .replaceAll('[[item_amount]]', item.grandTotal.toFixed(decimal))
    ).join('');
  
    // Replace the entire block from [[items_start]] to [[items_end]]
    const itemsRegex = /\[\[items_start\]\][\s\S]*?\[\[items_end\]\]/;
    const htmlWithItems = html.replace(itemsRegex, filledItems);

    const htmlS = htmlWithItems
      .replaceAll('[[invoice_number]]', invoice.number)
      .replaceAll('[[invoice_date]]', dayjs(invoice.date).format(dateFormat))
      .replaceAll('[[payment_due_date]]', dayjs(invoice.dueDate).format(dateFormat))
      .replaceAll('[[customer_name]]', invoice.customer.name)
      .replaceAll('[[customer_address]]', invoice.customer.address)
      .replaceAll('[[customer_phone]]', invoice.customer.phone)
      .replaceAll('[[customer_email]]', invoice.customer.email)
      .replaceAll('[[org_name]]', invoice.organization.name)
      .replaceAll('[[org_address]]', invoice.organization.address)
      .replaceAll('[[org_phone]]', invoice.organization.phone)
      .replaceAll('[[org_email]]', invoice.organization.email)
      .replaceAll('[[itemtotal]]',invoice.itemTotal.toFixed(decimal))
      .replaceAll('[[discount]]',invoice.discountTotal.toFixed(decimal))
      .replaceAll('[[subtotal]]', invoice.subTotal.toFixed(decimal))
      .replaceAll('[[tax_amount]]', invoice.taxTotal.toFixed(decimal))
      .replaceAll('[[roundoff]]',invoice.roundOff.toFixed(decimal))
      .replaceAll('[[grand_total]]', invoice.grandTotal.toFixed(decimal))
      .replaceAll('[[grand_total_inwords]]', invoice.grandTotalInWords)
      .replaceAll('[[logo_small_src]]', invoice.smallLogo || '')
      .replaceAll('[[logo_large_src]]', invoice.largeLogo || '')
      .replaceAll('[[currency_symbol]]', String.fromCharCode(parseInt(invoice.currency.unicode, 16)))
      .replaceAll('[[org_authority_name]]',invoice.organization.authorityName)
      .replaceAll('[[org_authority_designation]]',invoice.organization.authorityDesignation)
      .replaceAll('[[account_number]]',invoice.accountNumber)
      .replaceAll('[[account_name]]',invoice.accountName)
      .replaceAll('[[bank_name]]',invoice.bankName)
      .replaceAll('[[terms_and_conditions]]',invoice.terms)
      .replaceAll('[[notes]]',invoice.notes);
    return htmlS;
  
  }

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
  
    html2canvas(container, {
      scale: 2,
      useCORS: true
    }).then((canvas) => {
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
    })['catch']((err) => {
      console.error('Error generating PDF:', err);
      document.body.removeChild(container);
    });
  }

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