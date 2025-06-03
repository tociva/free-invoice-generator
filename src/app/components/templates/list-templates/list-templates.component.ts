import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { loadTemplates } from '../store/actions/template.actions';
import { TemplateItem } from '../store/model/template.model';
import { selectPageSize, selectPaginatedTemplateItems, selectTotalCount } from '../store/selectors/template.selector';
import { TemplateState } from '../store/state/template.state';
import { Invoice } from '../../invoice/store/model/invoice.model';
import { TaxOption } from '../../invoice/store/model/invoice.model';
import { MatIconModule } from '@angular/material/icon';

const sampleInvoice: Invoice = {
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
  selector: 'app-list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatPaginatorModule,
    MatCheckboxModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCardModule, MatIconModule
  ]
})
export class ListTemplatesComponent {
  private store = inject<Store<TemplateState>>(Store);
  templates: TemplateItem[] = [];
  filteredTemplates: TemplateItem[] = [];
  paginatedTemplates: TemplateItem[] = [];
  private safeHtmlMap: Record<string, SafeHtml> = {};

  filterText = '';
  filterSubject = new Subject<string>();
  selectedTaxTypes: string[] = [];
  taxOptions = ['IGST', 'CGST & SGST', 'Non-Taxable'];
  colorOptions = ['Red', 'Blue', 'Green', 'Yellow'];
  selectedColors: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

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
    this.store.select(selectPageSize).subscribe((pageSize) => {
      this.itemsPerPage = pageSize;
    });
    this.store.select(selectTotalCount).subscribe((totalCount) => {
      this.totalItems = totalCount;
    });
    this.store.select(selectPaginatedTemplateItems).subscribe((templates) => {
      this.templates = templates;
      this.templates.forEach((item) => this.fetchAndSanitizeHtml(item.path));
      this.applyFilter();
    });

    this.filterSubject.pipe(debounceTime(300)).subscribe((text) => {
      this.filterText = text;
      this.applyFilter();
    });

    this.store.select(selectPaginatedTemplateItems).subscribe((templates) => {
      const tmpls: TemplateItem[] = [];
      templates.forEach(async (item) => {
        const template = await firstValueFrom(this.http.get(item.path, { responseType: 'text' }));
        const html = this.fillTemplate(template);
        tmpls.push({
          name: item.name,
          path: item.path,
          html,
          template,
          taxType: item.taxType,
          color: item.color
        });
      });
      this.templates = tmpls;
    });
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        this.itemsPerPage = event.pageSize;
        this.updatePaginatedTemplates(event.pageIndex);
      });
    }
  }

  private fetchAndSanitizeHtml(path: string): void {
    this.http.get(path, { responseType: 'text' }).subscribe({
      next: (html: string) => {
        this.safeHtmlMap[path] = this.sanitizer.bypassSecurityTrustHtml(html);
      },
      error: (error) => console.error(`Failed to load HTML from ${path}`, error)
    });
  }

  findSafeHtml(path: string) {
    const rawHtml = this.safeHtmlMap[path] || '';
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
    return this.sanitizer.bypassSecurityTrustHtml(wrapperStyle + rawHtml);
  }

  onFilterInput(text: string) {
    this.filterSubject.next(text);
  }

  toggleTaxType(type: string) {
    const index = this.selectedTaxTypes.indexOf(type);
    if (index > -1) this.selectedTaxTypes.splice(index, 1);
    else this.selectedTaxTypes.push(type);
    this.applyFilter();
  }

  toggleColor(color: string) {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) this.selectedColors.splice(index, 1);
    else this.selectedColors.push(color);
    this.applyFilter();
  }
  applyFilter() {
    const lowerFilter = this.filterText.toLowerCase().trim();
    this.filteredTemplates = this.templates.filter(item => {
      const matchesText = item.name.toLowerCase().includes(lowerFilter);
      const matchesTax = this.selectedTaxTypes.length === 0 || this.selectedTaxTypes.includes(item.taxType || '');
      const matchesColor = this.selectedColors.length === 0 || this.selectedColors.includes(item.color || '');
      return matchesText && matchesTax && matchesColor;
    });

    this.totalItems = this.filteredTemplates.length;
    this.updatePaginatedTemplates(0);
    if (this.paginator) this.paginator.firstPage();
  }

  updatePaginatedTemplates(pageIndex: number) {
    const start = pageIndex * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedTemplates = this.filteredTemplates.slice(start, end);
  }

  clearFilters() {
    this.filterText = '';
    this.selectedTaxTypes = [];
    this.selectedColors = [];
    this.applyFilter();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
  buttonAction(action: string, item: TemplateItem) {
  const htmlContent = item.html as string;

  if (!htmlContent) {
    console.error('No HTML content available for', item.name);
    return;
  }

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  if (action === 'download') {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (action === 'print') {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(htmlContent);
    printWindow?.document.close();
    printWindow?.focus();
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 500);
  } else if (action === 'preview') {
    const previewWindow = window.open('', '_blank');
    previewWindow?.document.write(htmlContent);
    previewWindow?.document.close();
    previewWindow?.focus();
  }
}

}
