import {
  TngButtonComponent,
  TngCardComponent,
  TngProgressSpinnerComponent,
  TngStepperComponent,
  type TngStepperStep,
} from '@tailng-ui/components';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TngIcon } from '@tailng-ui/icons';
import { InvoiceCustomerComponent } from '../invoice-customer/invoice-customer';
import { InvoiceDetailsComponent } from '../invoice-details/invoice-details';
import { InvoiceItemsMobileComponent } from '../invoice-items-mobile/invoice-items-mobile';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items';
import { InvoiceLogoComponent } from '../invoice-logo/invoice-logo';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization';
import { InvoiceSummaryComponent } from '../invoice-summary/invoice-summary';
import { InvoiceTermsNotesComponent } from '../invoice-terms-notes/invoice-terms-notes';
import { PreviewInvoiceComponent } from '../preview-invoice/preview-invoice';
import { SelectTemplateComponent } from '../select-template/select-template';
import { SimpleInvoiceConfig } from '../simple-invoice-config/simple-invoice-config';
import { invoiceStore } from '../store/invoice.store';
import { InvoiceFormService } from '../store/models/invoice-form';
import { Invoice } from '../store/models/invoice-model';
import { InvoiceCalculationService } from '../store/services/calculation.services';
import { TemplateItem } from '../store/template/template.model';
import { templateStore } from '../store/template/template.store';

@Component({
  selector: 'app-simple-invoice',
  standalone: true,
  imports: [
    TngProgressSpinnerComponent,
    TngCardComponent,
    TngButtonComponent,
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
    TngIcon,
    TngStepperComponent,
  ],
  templateUrl: './simple-invoice.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './simple-invoice.css',
})
export class SimpleInvoice implements OnInit {
  totalAmount: number = 300000;
  store = inject(invoiceStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  formInvoice = inject(InvoiceFormService).form;
  calcService = inject(InvoiceCalculationService);
  templateStore = inject(templateStore);

  templates = computed(() => this.templateStore.templateItems());
  selectedTemplate = computed(
    () =>
      this.templates().find((item) => item.path === this.templateStore.selectedTemplatePath()) ??
      this.templates()[0] ??
      null,
  );

  private readonly destroyRef = inject(DestroyRef);
  currentStep = signal(1);

  steps = [
    { id: 1, label: 'Fill invoice details' },
    { id: 2, label: 'Select a template' },
    { id: 3, label: 'Preview and Download' },
  ];

  stepperSteps = computed<readonly TngStepperStep[]>(() =>
    this.steps.map((step) => ({
      value: step.id,
      label: step.label,
      completed: step.id < this.currentStep(),
    })),
  );

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === this.steps.length);

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param) => {
      const step = Number(param['step']);
      this.currentStep.set(
        Number.isInteger(step) && step >= 1 && step <= this.steps.length ? step : 1,
      );
    });
  }

  goToStep(stepId: number): void {
    if (!Number.isInteger(stepId) || stepId < 1 || stepId > this.steps.length) return;
    if (stepId >= 1 && stepId <= this.steps.length) {
      if (stepId > this.currentStep()) {
        this.saveInvoiceState();
      }
      this.currentStep.set(stepId);
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { step: stepId },
      queryParamsHandling: 'merge',
    });
  }

  onStepperValueChange(value: string | number): void {
    this.goToStep(Number(value));
  }
  // selectedTemplate = computed(() => this.templates().find(item => item.path === this.templateStore.selectedTemplatePath()) ?? this.templates()[0] ?? null);

  // onTemplateSelected(template: TemplateItem) {
  //   this.selectedTemplate.set(template);

  // }

  async ngOnInit() {
    this.calcService.initFormSubscriptions(this.formInvoice);

    this.calcService.calculateTotals(this.formInvoice);
    await this.templateStore.loadTemplates();
  }

  onTemplateSelected(item: TemplateItem) {
    this.templateStore.selectTemplate(item.path);
  }

  bindGrandTotalEffect = effect(() => {
    const words = this.calcService.grandTotalInWords();
    this.formInvoice.get('grandTotalInWords')?.setValue(words, { emitEvent: false });
  });

  temp() {
    this.goToStep(3);
  }

  saveInvoiceState() {
    const invoice = this.formInvoice.getRawValue() as Invoice;
    this.store.setInvoice(invoice);
    // this.store.resetInvoice();
    // this.router.navigate(['/Testing']);
  }
}
