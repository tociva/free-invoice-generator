import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { Invoice, TaxOption } from '../../invoice/store/model/invoice.model';
import { loadTemplates } from '../store/actions/template.actions';
import { TemplateItem } from '../store/model/template.model';
import { selectPaginatedTemplateItems } from '../store/selectors/template.selector';
import { TemplateState } from '../store/state/template.state';

const sampleInvoice:Invoice = {
  number: 'INV-AB-001',
  date: new Date(),
  dueDate: new Date(),
  currency: {
    name: 'Indian Rupee',
    html: '&#8377;',
    unicode: '20B9',
    decimal: 2
  },
  decimalPlaces: 2,
  deliveryState: 'Kerala',
  taxOption: TaxOption.CGST_SGST,
  hasItemDescription: true,
  hasItemDiscount: false,
  dateFormat: {
    name: '31-01-2022',
    value: 'DD-MM-YYYY'
  },
  organization: {
    name: 'ACME Organization',
    addressLine1: '123 Main St',
    addressLine2: 'PMG 123',
    street: 'Main Street',
    city: 'Pattom',
    zipCode: '695504',
    state: 'Kerala',
    country: {
      name: 'India',
      code: '91',
      iso: 'IN',
      currency: {
        name: 'Indian Rupee',
        html: '&#8377;',
        unicode: '20B9',
        decimal: 2
      },
      dateformat: {
        name: '31-01-2022',
        value: 'DD-MM-YYYY'
      }
    },
    email: 'organization@example.com',
    phone: '+91 9876543210',
    gstin: 'ABCD123456FFF'
  },
  customer: {
    name: 'ACME Customer',
    addressLine1: '123 Main St',
    addressLine2: 'PMG 123',
    street: 'Main Street',
    city: 'Pattom',
    zipCode: '695504',
    state: 'Kerala',
    country: {
      name: 'India',
      code: '91',
      iso: 'IN',
      currency: {
        name: 'Indian Rupee',
        html: '&#8377;',
        unicode: '20B9',
        decimal: 2
      },
      dateformat: {
        name: '31-01-2022',
        value: 'DD-MM-YYYY'
      }
    },
    email: 'customer@example.com',
    phone: '+91 9876543210',
    gstin: 'ABCD123456FFF'
  },
  items: [{
    name: 'ACME Product 1',
    description: 'ACME Product 1 Description',
    quantity: 1,
    price: 100,
    itemTotal: 100,
    discountAmount: 0,
    discPercentage: 0,
    subTotal: 100,
    tax1Amount: 9,
    tax1Percentage: 9,
    tax2Amount: 9,
    tax2Percentage: 9,
    tax3Amount: 0,
    tax3Percentage: 0,
    taxTotal: 18,
    grandTotal: 118,
  },
  {
    name: 'ACME Product 2',
    description: 'ACME Product 2 Description',
    quantity: 2,
    price: 100,
    itemTotal: 200,
    discountAmount: 0,
    discPercentage: 0,
    subTotal: 200,
    tax1Amount: 18,
    tax1Percentage: 9,
    tax2Amount: 18,
    tax2Percentage: 9,
    tax3Amount: 0,
    tax3Percentage: 0,
    taxTotal: 36,
    grandTotal: 236,
  }],
  itemTotal: 300,
  discountTotal: 0,
  subTotal: 300,
  taxTotal: 54,
  roundOff: 0,
  grandTotal: 354,
  grandTotalInWords: 'One Hundred Eighteen Only'
}

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TemplatesComponent {

  private store = inject<Store<TemplateState>>(Store);
  
  templates: TemplateItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}
  
  private fillTemplate(html: string): SafeHtml {
    const itemRowTemplate = `
      <tr>
        <td>[[item_name]]</td>
        <td>[[item_quantity]]</td>
        <td>[[item_price]]</td>
        <td>[[item_cgst]]</td>
        <td>[[item_sgst]]</td>
        <td>[[item_amount]]</td>
      </tr>`;
  
    const filledItems = sampleInvoice.items.map(item =>
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
  
    const nSafeHtml = htmlWithItems
      .replace('[[invoice_number]]', sampleInvoice.number)
      .replace('[[invoice_date]]', sampleInvoice.date.toLocaleDateString())
      .replace('[[payment_due_date]]', sampleInvoice.dueDate.toLocaleDateString())
      .replace('[[customer_name]]', sampleInvoice.customer.name)
      .replace('[[customer_address]]', sampleInvoice.customer.addressLine1)
      .replace('[[customer_phone]]', sampleInvoice.customer.phone)
      .replace('[[customer_email]]', sampleInvoice.customer.email)
      .replace('[[org_name]]', sampleInvoice.organization.name)
      .replace('[[org_address]]', sampleInvoice.organization.addressLine1)
      .replace('[[org_phone]]', sampleInvoice.organization.phone)
      .replace('[[org_email]]', sampleInvoice.organization.email)
      .replace('[[subtotal]]', sampleInvoice.subTotal.toFixed(2))
      .replace('[[tax_amount]]', sampleInvoice.taxTotal.toFixed(2))
      .replace('[[grand_total]]', sampleInvoice.grandTotal.toFixed(2))
      .replace('[[mail_logo_src]]', sampleInvoice.organization.name || '');
      const wrapperStyle = `
      <style>
        html, body {
          margin: 0;
          padding: 0;
          transform: scale(0.5);
          transform-origin: top left;
          width: 200%;
          height: 200%;
          overflow: hidden;
        }
      </style>
    `;
    const finalHtml = wrapperStyle + nSafeHtml;
    return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
  }

  ngOnInit() {
    this.store.dispatch(loadTemplates());
    this.store.select(selectPaginatedTemplateItems).subscribe((templates) => {
      const tmpls:TemplateItem[] = [];
      templates.forEach(async (item) => {
        const template = await firstValueFrom(this.http.get(item.path, { responseType: 'text' }));
        const html = this.fillTemplate(template);
        tmpls.push({
          name: item.name,
          path: item.path,
          html,
          template
        });
      });
      this.templates = tmpls;
    });
  }
}
