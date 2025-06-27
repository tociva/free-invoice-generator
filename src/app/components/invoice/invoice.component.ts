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
    InvoiceLogoComponent
],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {

  isStepComplete = false;

  stepIndex = 0;

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(private route: ActivatedRoute, private router: Router) { }

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
    void this.router.navigate(['/invoice'], { queryParams: { step } });
  }

  onStepClick(event: StepperSelectionEvent): void {
    void this.router.navigate(['/invoice'], { queryParams: { step: event.selectedIndex } });
  }
  onFinishClick(): void {
    void this.router.navigate(['/']);
  }
}
