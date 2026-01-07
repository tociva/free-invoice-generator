import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { InvoiceLogoComponent } from '../invoice-logo/invoice-logo';
import { InvoiceDetailsComponent } from '../invoice-details/invoice-details';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization';
import { InvoiceCustomerComponent } from '../invoice-customer/invoice-customer';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items';
import { InvoiceSummaryComponent } from '../invoice-summary/invoice-summary';
import { InvoiceTermsNotesComponent } from '../invoice-terms-notes/invoice-terms-notes';
import { SimpleInvoiceConfig } from '../simple-invoice-config/simple-invoice-config';
import { SelectTemplateComponent } from '../select-template/select-template';
import { PreviewInvoiceComponent } from '../preview-invoice/preview-invoice';

@Component({
  selector: 'app-simple-invoice',
  standalone: true,
  imports: [
    InvoiceLogoComponent,
    InvoiceDetailsComponent,
    InvoiceOrganizationComponent,
    InvoiceCustomerComponent,
    InvoiceItemsComponent,
    InvoiceSummaryComponent,
    InvoiceTermsNotesComponent,
    SimpleInvoiceConfig,
    SelectTemplateComponent,
    PreviewInvoiceComponent
  ],
  templateUrl: './simple-invoice.html',
  styleUrl: './simple-invoice.css',
})
export class SimpleInvoice {
    totalAmount: number = 300000;

  currentStep = signal(1);

  steps = [
    { id: 1, label: 'Fill invoice details' },
    { id: 2, label: 'Select a template' },
    { id: 3, label: 'Preview and Download' },
  ];

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === this.steps.length);

  goToStep(stepId: number): void {
    this.currentStep.set(stepId);
  }
  invoiceBasicDetails =signal<any>([]);
  onInvoiceDetails(data :any){
    this.invoiceBasicDetails.set(data);
  }
  logoFromChild: string | null = null;
  selectedTemplate = signal<any>(null);

  onLogoChange(logo: string | null) {
    console.log('Parent received logo:', logo );
    this.logoFromChild = logo;
  }

  onTemplateSelected(template: any) {
    this.selectedTemplate.set(template);
  }

  constructor() {
  effect(() => {
      console.log('Parent preview data:', this.invoiceBasicDetails());

    });
  }  

}
