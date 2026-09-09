import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  TngCheckboxAngularFormsAdapter,
  TngCheckboxComponent,
  TngInputFieldComponent,
} from '@tailng-ui/components';
import { TngInput } from '@tailng-ui/primitives';
import { TailngDate } from '../../shared/tailng-date';
import { TailngSelect } from '../../shared/tailng-select';
import { currencyStore } from '../store/currency/currency.store';
import { dateFormatStore } from '../store/date-format/date-format.store';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { TaxOption } from '../store/models/invoice-model';

@Component({
  selector: 'app-invoice-details',
  imports: [
    TailngSelect,
    TailngDate,
    TngInputFieldComponent,
    TngCheckboxComponent,
    TngCheckboxAngularFormsAdapter,
    TngInput,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './invoice-details.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./invoice-details.css'],
})
export class InvoiceDetailsComponent implements OnInit {
  advanced = input<boolean>(false);
  currencyStore = inject(currencyStore);
  dateFormatStore = inject(dateFormatStore);

  taxOptions = Object.values(TaxOption);

  ngOnInit(): void {
    this.currencyStore.loadCurrency();
    this.dateFormatStore.loadDateFormat();
  }

  public InvoiceDetailsForm = input.required<FormGroup<InvoiceForm>>();

  formatDateForInput(date: Date | null) {
    return date ? date.toISOString().substring(0, 10) : '';
  }
}
