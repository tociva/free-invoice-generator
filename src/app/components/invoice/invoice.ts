import { Component, computed, inject, signal } from '@angular/core';
import { InvoiceOrganizationComponent } from './invoice-organization/invoice-organization';
import { InvoiceCustomerComponent } from './invoice-customer/invoice-customer';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details';
import { InvoiceItemsComponent } from './invoice-items/invoice-items';
import { SelectTemplateComponent } from './select-template/select-template';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary';
import { invoiceStore } from './store/invoice.store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InvoiceForm } from './store/models/invoice-form.model';
import { createInvoice } from './store/models/invoice-form.factory';
import { InvoiceLogoComponent } from './invoice-logo/invoice-logo';
import { InvoiceTermsNotesComponent } from './invoice-terms-notes/invoice-terms-notes';

@Component({
  selector: 'app-invoice',
  imports: [
    InvoiceOrganizationComponent,
    InvoiceCustomerComponent,
    InvoiceDetailsComponent,
    InvoiceItemsComponent,
    SelectTemplateComponent,
    PreviewInvoiceComponent,
    InvoiceSummaryComponent,
    InvoiceLogoComponent,
    InvoiceTermsNotesComponent,
  ],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css',
})
export class Invoice {
  currentStep = signal(1);

  steps = [
    { id: 1, label: 'My Organization Info & Logo' },
    { id: 2, label: 'Customer Details' },
    { id: 3, label: 'Invoice Details' },
    { id: 4, label: 'Items and Summary' },
    { id: 5, label: 'Select a template' },
    { id: 6, label: 'Preview and Download' },
  ];

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === this.steps.length);

  goToStep(stepId: number): void {
    this.currentStep.set(stepId);
  }
  private store = inject(invoiceStore);
  private fb = inject(FormBuilder);
  formInvoice!: FormGroup<InvoiceForm>;
  constructor() {
    this.formInvoice = createInvoice(this.fb, this.store.invoice());
  }
}
