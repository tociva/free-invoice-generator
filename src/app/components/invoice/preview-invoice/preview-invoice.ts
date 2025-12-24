import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceLogoComponent } from '../invoice-logo/invoice-logo';
import { InvoiceDetailsComponent } from '../invoice-details/invoice-details';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization';
import { InvoiceCustomerComponent } from '../invoice-customer/invoice-customer';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items';
import { InvoiceSummaryComponent } from '../invoice-summary/invoice-summary';
import { InvoiceTermsNotesComponent } from '../invoice-terms-notes/invoice-terms-notes';

@Component({
  selector: 'app-preview-invoice',
  standalone: true,
  imports: [
    CommonModule,
    InvoiceLogoComponent,
    InvoiceDetailsComponent,
    InvoiceOrganizationComponent,
    InvoiceCustomerComponent,
    InvoiceItemsComponent,
    InvoiceSummaryComponent,
    InvoiceTermsNotesComponent,
  ],
  templateUrl: './preview-invoice.html',
  styleUrls: ['./preview-invoice.css'],
})
export class PreviewInvoiceComponent implements OnInit {
  totalAmount: number = 300000;

  ngOnInit(): void {}
}
