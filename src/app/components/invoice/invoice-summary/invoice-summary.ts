import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  TngCheckboxAngularFormsAdapter,
  TngCheckboxComponent,
  TngInputFieldComponent,
} from '@tailng-ui/components';
import { TngInput } from '@tailng-ui/primitives';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { InvoiceCalculationService } from '../store/services/calculation.services';

@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [
    TngInputFieldComponent,
    TngCheckboxComponent,
    TngCheckboxAngularFormsAdapter,
    TngInput,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './invoice-summary.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./invoice-summary.css'],
})
export class InvoiceSummaryComponent {
  InvoiceSummary = input.required<FormGroup<InvoiceForm>>();

  advanced = input<boolean>(false);
  hasItemDiscount = input<boolean>();
  selectedTaxOption = input<string>('');
  invoiceService = inject(InvoiceCalculationService);
}
