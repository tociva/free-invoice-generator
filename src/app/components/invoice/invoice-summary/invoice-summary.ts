import { Component, effect, inject, input, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { InvoiceCalculationService } from '../store/services/calculation.services';

@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-summary.html',
  styleUrls: ['./invoice-summary.css'],
})
export class InvoiceSummaryComponent {
  InvoiceSummary = input.required<FormGroup<InvoiceForm>>();

  advanced = input<boolean>(false);
  hasItemDiscount = input<boolean>();
  selectedTaxOption = input<string>('');
  invoiceService = inject(InvoiceCalculationService)



}
