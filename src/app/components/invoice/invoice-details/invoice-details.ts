import { Component, inject, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { dateFormatStore } from '../store/date-format/date-format.store';
import { currencyStore } from '../store/currency/currency.store';
import { TaxOption } from '../store/models/invoice-model';
import { Currency } from '../store/currency/currency.model';

@Component({
  selector: 'app-invoice-details',
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.css'],
  providers: [dateFormatStore, currencyStore],
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
