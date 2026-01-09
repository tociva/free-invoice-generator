import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { InvoiceLogoComponent } from '../invoice-logo/invoice-logo';
import { InvoiceDetailsComponent } from '../invoice-details/invoice-details';
import { InvoiceCustomerComponent } from '../invoice-customer/invoice-customer';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items';
import { InvoiceSummaryComponent } from '../invoice-summary/invoice-summary';
import { InvoiceTermsNotesComponent } from '../invoice-terms-notes/invoice-terms-notes';
import { SimpleInvoiceConfig } from '../simple-invoice-config/simple-invoice-config';
import { SelectTemplateComponent } from '../select-template/select-template';
import { PreviewInvoiceComponent } from '../preview-invoice/preview-invoice';
import { invoiceStore } from '../store/invoice.store';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { createInvoice } from '../store/models/invoice-form.factory';
import {  JsonPipe } from '@angular/common';
import { CurrencyUtil } from '../store/currency/currency.util';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization';

@Component({
  selector: 'app-simple-invoice',
  standalone: true,
  imports: [
    InvoiceLogoComponent,
    InvoiceDetailsComponent,
    InvoiceCustomerComponent,
    InvoiceOrganizationComponent,
    InvoiceItemsComponent,
    InvoiceSummaryComponent,
    InvoiceTermsNotesComponent,
    SimpleInvoiceConfig,
    SelectTemplateComponent,
    PreviewInvoiceComponent,
    JsonPipe,
  ],
  templateUrl: './simple-invoice.html',
  styleUrl: './simple-invoice.css',
})
export class SimpleInvoice implements OnInit {
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

  private store = inject(invoiceStore);
  private fb = inject(FormBuilder);
  grandTotal = signal(0);
formInvoice!: FormGroup<InvoiceForm>;

  ngOnInit(): void {
    this.formInvoice = createInvoice(this.fb, this.store.invoice());
    this.calculateItemTotal();
    const items = this.formInvoice.get('items') as FormArray;
    items.valueChanges.subscribe(() => this.calculateItemTotal());
    this.formInvoice.get('roundOff')?.valueChanges.subscribe(() => this.calculateItemTotal());

}
  

  calculateItemTotal() {
  const items = this.formInvoice.get('items') as FormArray;
  const Total = items.controls.reduce((acc,item)=>acc + (item.get('itemTotal')?.value || 0),0);
  this.formInvoice.get('itemTotal')?.setValue(Total, { emitEvent: false });

  const roundOff = this.formInvoice.get('roundOff')?.value || 0;
  
  
  const taxTotal = this.formInvoice.get('taxTotal')?.value || 0;
  const grandTotal = Total + taxTotal + roundOff;

  this.formInvoice.get('grandTotal')?.setValue(grandTotal, { emitEvent: false });
  this.grandTotal.set(grandTotal);
  }

  
  grandTotalInWords = computed(() =>
  CurrencyUtil.numberToWords(
    this.grandTotal(),
    'INR',
    'Paisa',
    2,
    false
  )
); 


constructor() {
  this.formInvoice = createInvoice(this.fb, this.store.invoice());
}
  
}

