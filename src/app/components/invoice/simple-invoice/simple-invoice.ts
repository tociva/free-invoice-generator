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
import { JsonPipe } from '@angular/common';
import { CurrencyUtil } from '../store/currency/currency.util';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization';
import { InvoiceFormService } from '../store/models/invoice-form';
import { Invoice } from '../store/models/invoice-model';
import { Router } from '@angular/router';

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
  ],
  templateUrl: './simple-invoice.html',
  styleUrl: './simple-invoice.css',
})
export class SimpleInvoice implements OnInit {
  totalAmount: number = 300000;
  store = inject(invoiceStore);
  router = inject(Router);

  currentStep = signal(1);

  steps = [
    { id: 1, label: 'Fill invoice details' },
    { id: 2, label: 'Select a template' },
    { id: 3, label: 'Preview and Download' },
  ];

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === this.steps.length);

  goToStep(stepId: number): void {
    // this.currentStep.set(stepId);
    if (stepId >= 1 && stepId <= this.steps.length) {
      if (stepId > this.currentStep()) {
        this.saveInvoiceState();
      }
      this.currentStep.set(stepId);
    }
  }

  // invoiceBasicDetails =signal<any>([]);
  // onInvoiceDetails(data :any){
  //   this.invoiceBasicDetails.set(data);
  // }
  selectedTemplate = signal<any>(null);

  onTemplateSelected(template: any) {
    this.selectedTemplate.set(template);
  }
  formInvoice = inject(InvoiceFormService).form;
  grandTotal = signal(0);

  items = signal<any[]>([]);

  ngOnInit(): void {
    const itemsArray = this.formInvoice.get('items') as FormArray;
    itemsArray.valueChanges.subscribe(() => {
      this.items.set(itemsArray.getRawValue());
      this.calculateGrandTotal();
    });

    this.items.set(itemsArray.getRawValue());
    this.formInvoice.get('')
  }

  calculateGrandTotal() {
    const items = this.formInvoice.get('items') as FormArray;
    const total = items.controls.reduce(
      (sum, item) => sum + (item.get('itemTotal')?.value || 0),
      0
    );
    const disAmount = items.controls.reduce(
      (sum ,disamt) => sum +(disamt.get('discountAmount')?.value || 0),
      0
    )
    const subT = items.controls.reduce(
      (sum,subT) => sum +(subT.get('subTotal')?.value || 0),
      0
    )
    const taxT = items.controls.reduce(
      (sum,taxT) => sum +(taxT.get('taxTotal')?.value || 0),
      0
    )
    const grandT = items.controls.reduce(
      (sum,grandT) => sum +(grandT.get('grandTotal')?.value || 0),
      0
    )

    const roundOff = this.formInvoice.get('roundOff')?.value || 0;
    this.formInvoice.get('discountTotal')?.setValue(disAmount, { emitEvent: false });
    this.formInvoice.get('subTotal')?.setValue(subT, { emitEvent: false });

    this.formInvoice.get('itemTotal')?.setValue(total, { emitEvent: false });
    this.formInvoice.get('grandTotal')?.setValue(grandT, { emitEvent: false });
  this.formInvoice.get('taxTotal')?.setValue(taxT, { emitEvent: false });

    this.grandTotal.set(grandT);
  }


  grandTotalInWords = computed(() =>
    CurrencyUtil.numberToWords(this.grandTotal(), 'INR', 'Paisa', 2, false)
  );

eff= effect(() => {
  const code = this.formInvoice.get('currency')?.value;
  console.log(code);
  
  console.log('Grand Total in Words:', this.grandTotalInWords());
});
  saveInvoiceState() {
    const invoice = this.formInvoice.getRawValue() as Invoice;
    this.store.setInvoice(invoice);
    this.router.navigate(['/Testing']);
  }
}
