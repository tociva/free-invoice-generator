import { Component, computed, effect, inject, OnInit, output, signal } from '@angular/core';
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
import { FormArray } from '@angular/forms';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization';
import { InvoiceFormService } from '../store/models/invoice-form';
import { Invoice } from '../store/models/invoice-model';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceCalculationService } from '../store/services/calculation.services';
import { InvoiceItemsMobileComponent } from '../invoice-items-mobile/invoice-items-mobile';
import { NgIcon } from '@ng-icons/core';
import { TemplateItem } from '../store/template/template.model';
import { templateStore } from '../store/template/template.store';
import { HttpClient } from '@angular/common/http';
import { TemplateService } from '../store/services/template.services';
import { firstValueFrom } from 'rxjs';
import { TemplateLoaderService } from '../store/services/template-loader.service';

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
    InvoiceItemsMobileComponent,
    NgIcon,
  ],
  templateUrl: './simple-invoice.html',
  styleUrl: './simple-invoice.css',
})
export class SimpleInvoice implements OnInit {
  totalAmount: number = 300000;
  store = inject(invoiceStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private _http = inject(HttpClient);
  templateService = inject(TemplateService);
  formInvoice = inject(InvoiceFormService).form;
  calcService = inject(InvoiceCalculationService);
  templateStore = inject(templateStore);
  private templateLoader = inject(TemplateLoaderService);

  templates = signal<TemplateItem[]>([]);
  selectedTemplate = signal<TemplateItem | null>(null);

  currentStep = signal(1);

  steps = [
    { id: 1, label: 'Fill invoice details' },
    { id: 2, label: 'Select a template' },
    { id: 3, label: 'Preview and Download' },
  ];

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === this.steps.length);

  constructor() {
    this.route.queryParams.subscribe((param) => {
      const step = Number(param['step']);
      if (step && step >= 1 && step <= this.steps.length) {
        this.currentStep.set(step);
      }
    });
  }

  goToStep(stepId: number): void {
    if (stepId >= 1 && stepId <= this.steps.length) {
      if (stepId > this.currentStep()) {
        this.saveInvoiceState();
      }
      this.currentStep.set(stepId);
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { stepId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  // selectedTemplate = signal<TemplateItem | null>(null);

  // onTemplateSelected(template: TemplateItem) {
  //   this.selectedTemplate.set(template);

  // }

  async ngOnInit() {
    const itemsArray = this.formInvoice.get('items') as FormArray;

    this.calcService.initFormSubscriptions(this.formInvoice);

    this.calcService.calculateTotals(this.formInvoice);

    itemsArray.valueChanges.subscribe(() => {
      this.calcService.calculateTotals(this.formInvoice);
    });
    const loadedTemplates = await this.templateLoader.loadTemplates();
    this.templates.set(loadedTemplates);

    const defaultPath = this.templateStore.selectedTemplatePath();
    const defaultTemplate = loadedTemplates.find(t => t.path === defaultPath);
    if (defaultTemplate) this.onTemplateSelected(defaultTemplate);
  }

  onTemplateSelected(item: TemplateItem) {
    this.selectedTemplate.set(item);
  }

    

  bindGrandTotalEffect = effect(() => {
    const words = this.calcService.grandTotalInWords();
    this.formInvoice.get('grandTotalInWords')?.setValue(words, { emitEvent: false });
  });

  temp() {
    this.currentStep.set(3);
  }

  saveInvoiceState() {
    const invoice = this.formInvoice.getRawValue() as Invoice;
    this.store.setInvoice(invoice);
    // this.store.resetInvoice();
    // this.router.navigate(['/Testing']);
  }
}
