import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { SelectTemplateComponent } from './select-template/select-template.component';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice.component';
import { CreateInvoiceOrganizationComponent } from './create-organization-details/create-invoice-organization.component';
import { CreateInvoiceLogoComponent } from './create-organization-logo/create-invoice-logo.component';
import { CreateInvoiceCustomerComponent } from './create-invoice/create-customer-details/create-invoice-customer.component';


@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    CreateInvoiceComponent,
    CreateInvoiceOrganizationComponent,
    CreateInvoiceLogoComponent,
    CreateInvoiceCustomerComponent,
    SelectTemplateComponent,
    PreviewInvoiceComponent
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, AfterViewInit {
  stepIndex = 0;

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(private route: ActivatedRoute) { }

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
}
