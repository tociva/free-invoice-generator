import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { InvoiceOrganizationComponent } from './invoice-organization/invoice-organization';
import { InvoiceCustomerComponent } from './invoice-customer/invoice-customer';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details';
import { InvoiceItemsComponent } from './invoice-items/invoice-items';
import { InvoiceItemsMobileComponent } from './invoice-items-mobile/invoice-items-mobile';
import { SelectTemplateComponent } from './select-template/select-template';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary';
import { InvoiceLogoComponent } from './invoice-logo/invoice-logo';
import { InvoiceTermsNotesComponent } from './invoice-terms-notes/invoice-terms-notes';
import { InvoiceFormService } from './store/models/invoice-form';
import { InvoiceCalculationService } from './store/services/calculation.services';
import { FormArray } from '@angular/forms';
import { invoiceStore } from './store/invoice.store';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-invoice',
  imports: [
    InvoiceOrganizationComponent,
    InvoiceCustomerComponent,
    InvoiceDetailsComponent,
    InvoiceItemsComponent,
    InvoiceItemsMobileComponent,
    SelectTemplateComponent,
    PreviewInvoiceComponent,
    InvoiceSummaryComponent,
    InvoiceLogoComponent,
    InvoiceTermsNotesComponent,
    NgIcon
  ],
  templateUrl: './invoice.html',
  styleUrl: './invoice.css',
})
export class Invoice implements OnInit {
  currentStep = signal(1);
  store = inject(invoiceStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  selectedTemplate = signal<any>(null);
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
  constructor(){
    this.route.queryParams.subscribe(params=>{
      const step = Number(params['step']);
      if(step && step >=1  && step<=this.steps.length){
        this.currentStep.set(step);
      }
    })
  }

  goToStep(stepId: number): void {
    this.saveCurrentStepState();
     if (stepId < 1) stepId = 1;
  if (stepId > this.steps.length) stepId = this.steps.length;

  this.currentStep.set(stepId);
  this.router.navigate([],{
    relativeTo:this.route,
    queryParams:{stepId},
    queryParamsHandling:'merge',
    replaceUrl:true

  })

  }

  onTemplateSelected(template: any) {
    this.selectedTemplate.set(template);
  }
  
  formInvoice = inject(InvoiceFormService).form;
  hasItemDescription = signal(false);
  hasItemDiscount = signal(false);
  internationalNumbering = signal(false);
  selectedTaxOption = signal<string>(this.formInvoice.get('taxOption')?.value || '');
  calcService = inject(InvoiceCalculationService);

    

  ngOnInit() {
    this.formInvoice.get('hasItemDescription')?.valueChanges.subscribe((value) => {
      this.hasItemDescription.set(value);
    });

    this.formInvoice.get('hasItemDiscount')?.valueChanges.subscribe((value) => {
      this.hasItemDiscount.set(value);
    });

    this.formInvoice.get('taxOption')?.valueChanges.subscribe((value) => {
      this.selectedTaxOption.set(value);
    });
    this.formInvoice.get('internationalNumbering')?.valueChanges.subscribe((value) => {
      this.internationalNumbering.set(value);
    });
    const itemsArray = this.formInvoice.get('items') as FormArray;

  this.calcService.initFormSubscriptions(this.formInvoice);

  this.calcService.calculateTotals(this.formInvoice);

  itemsArray.valueChanges.subscribe(() => {
    this.calcService.calculateTotals(this.formInvoice);
  });
  }

    bindGrandTotalEffect = effect(() => {
    const words = this.calcService.grandTotalInWords();
    this.formInvoice.get('grandTotalInWords')?.setValue(words, { emitEvent: false });
  });
  saveCurrentStepState() {
  const invoice = this.formInvoice.getRawValue();
  this.store.setInvoice(invoice); 
  // this.store.resetInvoice();
}
}
