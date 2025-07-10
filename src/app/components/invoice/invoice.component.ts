import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { InvoiceCustomerComponent } from './invoice-customer/invoice-customer.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { InvoiceItemsComponent } from './invoice-items/invoice-items.component';
import { InvoiceLogoComponent } from './invoice-logo/invoice-logo.component';
import { InvoiceOrganizationComponent } from './invoice-organization/invoice-organization.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice.component';
import { SelectTemplateComponent } from './select-template/select-template.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { CloudDataService } from '../../services/cloud-data.service';
import { isMobile } from '../../../util/daybook.util';
import { InvoiceItemsMobileComponent } from './invoice-items-mobile/invoice-items-mobile.component';
import { InvoiceAmountWordsComponent } from './invoice-amount-words/invoice-amount-words.component';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    InvoiceCustomerComponent,
    InvoiceDetailsComponent,
    InvoiceItemsComponent,
    InvoiceSummaryComponent,
    SelectTemplateComponent,
    PreviewInvoiceComponent,
    InvoiceOrganizationComponent,
    InvoiceLogoComponent,
    InvoiceItemsMobileComponent,
    InvoiceAmountWordsComponent
],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {

  isStepComplete = false;

  stepIndex = 0;

  mobileView = isMobile();

  @ViewChild('stepper') stepper!: MatStepper;

  private stepLabels = [
    'My Organization Info & Logo',
    'Customer Details',
    'Invoice Details',
    'Items and Summary',
    'Select a template',
    'Preview and Download'
  ];

  constructor(private route: ActivatedRoute, private router: Router,
    private cloudDataService: CloudDataService
  ) { }

  ngOnInit(): void {
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
    void this.cloudDataService.trackEvent(`from-invoice-creator-button-step-${this.stepIndex}-to-step-${step}`);
    void this.router.navigate(['/invoice'], { queryParams: { step } });
  }

  onStepClick(event: StepperSelectionEvent): void {
    void this.cloudDataService.trackEvent(`from-invoice-creator-stepper-step-${this.stepIndex}-to-step-${event.selectedIndex}`);
    void this.router.navigate(['/invoice'], { queryParams: { step: event.selectedIndex } });
  }
  onFinishClick(): void {
    void this.cloudDataService.trackEvent('from-invoice-creator-finish-to-home');
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
