import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { isMobile } from '../../../../util/daybook.util';
import { CloudDataService } from '../../../services/cloud-data.service';
import { InvoiceLogoComponent } from '../invoice-logo/invoice-logo.component';
import { PreviewInvoiceComponent } from '../preview-invoice/preview-invoice.component';
import { SelectTemplateComponent } from '../select-template/select-template.component';
import { InvoiceOrganizationComponent } from '../invoice-organization/invoice-organization.component';
import { InvoiceCustomerComponent } from '../invoice-customer/invoice-customer.component';
import { InvoiceDetailsComponent } from '../invoice-details/invoice-details.component';
import { InvoiceItemsComponent } from '../invoice-items/invoice-items.component';
import { Store } from '@ngrx/store';
import { setInvoiceInternationalNumbering, setInvoiceItemDescription, setInvoiceShowDiscount, setInvoiceTaxOption } from '../store/actions/invoice.action';
import { TaxOption } from '../store/model/invoice.model';
import { InvoiceSummaryComponent } from '../invoice-summary/invoice-summary.component';
import { InvoiceAmountWordsComponent } from '../invoice-amount-words/invoice-amount-words.component';

@Component({
  selector: 'app-simple-invoice',
  imports: [CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    SelectTemplateComponent,
    PreviewInvoiceComponent,
    InvoiceLogoComponent,
    InvoiceOrganizationComponent,
    InvoiceCustomerComponent,
    InvoiceDetailsComponent,
    InvoiceItemsComponent,
    InvoiceSummaryComponent,
    InvoiceAmountWordsComponent
    ],
  templateUrl: './simple-invoice.component.html',
  styleUrl: './simple-invoice.component.scss'
})
export class SimpleInvoiceComponent implements OnInit, AfterViewInit {
  isStepComplete = false;

  stepIndex = 0;

  mobileView = isMobile();

  @ViewChild('stepper') stepper!: MatStepper;

  private stepLabels = [
    'Fill invoice details',
    'Select a template',
    'Preview and Download'
  ];

  constructor(private route: ActivatedRoute, private router: Router,
    private cloudDataService: CloudDataService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.dispatch(setInvoiceTaxOption({ option: TaxOption.NON_TAXABLE }));
    this.store.dispatch(setInvoiceItemDescription({ itemDescription: true }));
    this.store.dispatch(setInvoiceShowDiscount({ showDiscount: false }));
    this.store.dispatch(setInvoiceInternationalNumbering({ internationalNumbering: true }));
    this.route.queryParams.subscribe((params: { step?: string }) => {
      const step = Number(params.step);
      if (!isNaN(step)) {
        this.stepIndex = step;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.stepper) {
        this.stepper.selectedIndex = this.stepIndex;
      }
    });
  }

  gotToStep(step: number): void {
    void this.cloudDataService.trackEvent(`from-simple-invoice-creator-button-step-${this.stepIndex}-to-step-${step}`);
    void this.router.navigate(['/simple-invoice'], { queryParams: { step } });
  }

  onStepClick(event: StepperSelectionEvent): void {
    void this.cloudDataService.trackEvent(`from-simple-invoice-creator-stepper-step-${this.stepIndex}-to-step-${event.selectedIndex}`);
    void this.router.navigate(['/simple-invoice'], { queryParams: { step: event.selectedIndex } });
  }
  onFinishClick(): void {
    void this.cloudDataService.trackEvent('from-simple-invoice-creator-finish-to-home');
    void this.router.navigate(['/']);
  }
  getStepLabel(index: number): string {
    return this.stepLabels[index];
  }
  onSwipeLeft() {
    this.gotToStep(this.stepIndex + 1);
  }
  
  onSwipeRight() {
    this.gotToStep(this.stepIndex - 1);
  }

  goNext(): void {
    if (this.stepIndex < 5) {
      this.gotToStep(this.stepIndex + 1);
    }
  }

  goPrevious(): void {
    if (this.stepIndex > 0) {
      this.gotToStep(this.stepIndex - 1);
    }
  }
}
