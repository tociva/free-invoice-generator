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
import {
  TngButtonComponent,
  TngStepperComponent,
  type TngStepperStep,
} from '@tailng-ui/components';
import { TngIcon } from '@tailng-ui/icons';
import { InvoiceCustomerComponent } from './invoice-customer/invoice-customer';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details';
import { InvoiceItemsComponent } from './invoice-items/invoice-items';
import { InvoiceLogoComponent } from './invoice-logo/invoice-logo';
import { InvoiceOrganizationComponent } from './invoice-organization/invoice-organization';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice';
import { SelectTemplateComponent } from './select-template/select-template';
import { invoiceStore } from './store/invoice.store';
import { InvoiceFormService } from './store/models/invoice-form';
import { InvoiceCalculationService } from './store/services/calculation.services';
import { TemplateItem } from './store/template/template.model';
import { templateStore } from './store/template/template.store';

import { ADVANCED_INVOICE_STEPS } from './invoice-steps';

@Component({
  selector: 'app-invoice',
  imports: [
    TngButtonComponent,
    InvoiceOrganizationComponent,
    InvoiceCustomerComponent,
    InvoiceDetailsComponent,
    InvoiceItemsComponent,
    SelectTemplateComponent,
    PreviewInvoiceComponent,
    InvoiceSummaryComponent,
    InvoiceLogoComponent,
    TngIcon,
    TngStepperComponent,
  ],
  templateUrl: './invoice.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoice.css',
})
export class Invoice implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  currentStep = signal(1);
  store = inject(invoiceStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  steps = ADVANCED_INVOICE_STEPS;

  stepperSteps = computed<readonly TngStepperStep[]>(() =>
    this.steps.map(
      (step) =>
        ({
          value: step.id,
          label: step.label,
          completed: step.id < this.currentStep(),
          description: step.description,
        }) as TngStepperStep,
    ),
  );

  isFirstStep = computed(() => this.currentStep() === 1);
  isLastStep = computed(() => this.currentStep() === this.steps.length);
  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const step = Number(params['step']);
      this.currentStep.set(
        Number.isInteger(step) && step >= 1 && step <= this.steps.length ? step : 1,
      );
    });
  }

  goToStep(stepId: number): void {
    if (!Number.isInteger(stepId) || stepId < 1 || stepId > this.steps.length) return;
    this.saveCurrentStepState();
    if (stepId < 1) stepId = 1;
    if (stepId > this.steps.length) stepId = this.steps.length;

    this.currentStep.set(stepId);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { step: stepId },
      queryParamsHandling: 'merge',
    });
  }

  onStepperValueChange(value: string | number): void {
    this.goToStep(Number(value));
  }

  formInvoice = inject(InvoiceFormService).form;
  hasItemDescription = signal(this.formInvoice.controls.hasItemDescription.value);
  hasItemDiscount = signal(this.formInvoice.controls.hasItemDiscount.value);
  internationalNumbering = signal(false);
  selectedTaxOption = signal<string>(this.formInvoice.get('taxOption')?.value || '');
  calcService = inject(InvoiceCalculationService);

  templates = computed(() => this.templateStore.templateItems());
  selectedTemplate = computed(
    () =>
      this.templates().find((item) => item.path === this.templateStore.selectedTemplatePath()) ??
      this.templates()[0] ??
      null,
  );
  templateStore = inject(templateStore);

  async ngOnInit() {
    this.formInvoice
      .get('hasItemDescription')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.hasItemDescription.set(value);
      });

    this.formInvoice
      .get('hasItemDiscount')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.hasItemDiscount.set(value);
      });

    this.formInvoice
      .get('taxOption')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.selectedTaxOption.set(value);
      });
    this.formInvoice
      .get('internationalNumbering')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.internationalNumbering.set(value);
      });

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
  saveCurrentStepState() {
    const invoice = this.formInvoice.getRawValue();
    this.store.setInvoice(invoice);
    // this.store.resetInvoice();
  }
}
