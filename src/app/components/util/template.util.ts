import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TemplateItem } from '../templates/store/model/template.model';
import { Invoice } from '../invoice/store/model/invoice.model';
import dayjs from 'dayjs';

export class TemplateUtil {
  
  public static fillTemplate(html: string, invoice: Invoice): string {
    const dateFormat = invoice.dateFormat.value;
    const itemRowTemplate = `
      <tr>
        <td>[[item_name]]</td>
        <td>[[item_quantity]]</td>
        <td>[[item_price]]</td>
        <td>[[item_cgst]]</td>
        <td>[[item_sgst]]</td>
        <td>[[item_amount]]</td>
      </tr>`;

    const filledItems = invoice.items.map((item) =>
      itemRowTemplate
        .replace('[[item_name]]', item.name)
        .replace('[[item_quantity]]', item.quantity.toString())
        .replace('[[item_price]]', item.price.toFixed(2))
        .replace('[[item_cgst]]', item.tax1Amount.toFixed(2))
        .replace('[[item_sgst]]', item.tax2Amount.toFixed(2))
        .replace('[[item_amount]]', item.grandTotal.toFixed(2))
    ).join('');
  
    // Replace the entire block from [[items_start]] to [[items_end]]
    const itemsRegex = /\[\[items_start\]\][\s\S]*?\[\[items_end\]\]/;
    const htmlWithItems = html.replace(itemsRegex, filledItems);

    const htmlS = htmlWithItems
      .replace('[[invoice_number]]', invoice.number)
      .replace('[[invoice_date]]', dayjs(invoice.date).format(dateFormat))
      .replace('[[payment_due_date]]', dayjs(invoice.dueDate).format(dateFormat))
      .replace('[[customer_name]]', invoice.customer.name)
      .replace('[[customer_address]]', invoice.customer.address)
      .replace('[[customer_phone]]', invoice.customer.phone)
      .replace('[[customer_email]]', invoice.customer.email)
      .replace('[[org_name]]', invoice.organization.name)
      .replace('[[org_address]]', invoice.organization.address)
      .replace('[[org_phone]]', invoice.organization.phone)
      .replace('[[org_email]]', invoice.organization.email)
      .replace('[[itemtotal]]',invoice.itemTotal.toFixed(2))
      .replace('[[discount]]',invoice.discountTotal.toFixed(2))
      .replace('[[subtotal]]', invoice.subTotal.toFixed(2))
      .replace('[[tax_amount]]', invoice.taxTotal.toFixed(2))
      .replace('[[roundoff]]',invoice.roundOff.toFixed(2))
      .replace('[[grand_total]]', invoice.grandTotal.toFixed(2))
      .replace('[[grand_total_inwords]]', invoice.grandTotalInWords)
      .replace('[[logo_small_src]]', invoice.smallLogo || '')
      .replace('[[logo_large_src]]', invoice.largeLogo || '')
      .replace('[[currency_symbol]]', String.fromCharCode(parseInt(invoice.currency.unicode, 16)))
      .replace('[[org_authority_name]]',invoice.organization.authorityName)
      .replace('[[org_authority_designation]]',invoice.organization.authorityDesignation)
      .replace('[[account_number]]',invoice.accountNumber)
      .replace('[[account_name]]',invoice.accountName)
      .replace('[[bank_name]]',invoice.bankName)
      .replace('[[terms_and_conditions]]',invoice.terms)
      .replace('[[notes]]',invoice.notes);
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