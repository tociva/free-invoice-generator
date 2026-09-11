import {
  TngCardComponent,
  TngDatepickerComponent,
  TngCheckboxAngularFormsAdapter,
  TngCheckboxComponent,
  TngInputFieldComponent,
  TngAutocompleteComponent,
} from '@tailng-ui/components';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TngInput } from '@tailng-ui/primitives';
import { Currency } from '../store/currency/currency.model';
import { currencyStore } from '../store/currency/currency.store';
import { DateFormat } from '../store/date-format/date-format.model';
import { dateFormatStore } from '../store/date-format/date-format.store';
import { InvoiceForm } from '../store/models/invoice-form.model';
import { TaxOption } from '../store/models/invoice-model';

type InvoiceDateField = 'invoiceDate' | 'invoiceDueDate';

@Component({
  selector: 'app-invoice-details',
  imports: [
    TngCardComponent,
    TngAutocompleteComponent,
    TngDatepickerComponent,
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

  public InvoiceDetailsForm = input.required<FormGroup<InvoiceForm>>();

  // ---------------------------------------------------------------------
  // Search state – tng-autocomplete does NOT filter options itself.
  // ---------------------------------------------------------------------
  readonly currencyQuery = signal('');
  readonly taxOptionQuery = signal('');
  readonly dateFormatQuery = signal('');

  readonly filteredCurrencies = computed<readonly Currency[]>(() => {
    const q = this.currencyQuery().trim().toLowerCase();
    const list = this.currencyStore.currencies();
    if (!q) {
      return list;
    }
    return list.filter((c) => this.stringFields(c).some((t) => t.toLowerCase().startsWith(q)));
  });

  readonly filteredTaxOptions = computed(() => {
    const q = this.taxOptionQuery().trim().toLowerCase();
    if (!q) {
      return this.taxOptions;
    }
    return this.taxOptions.filter((t) => String(t).toLowerCase().startsWith(q));
  });

  readonly filteredDateFormats = computed<readonly DateFormat[]>(() => {
    const q = this.dateFormatQuery().trim().toLowerCase();
    const list = this.dateFormatStore.dateFormat();
    if (!q) {
      return list;
    }
    return list.filter((f) => this.dateFormatLabel(f).toLowerCase().startsWith(q));
  });

  // ---------------------------------------------------------------------
  // Display: currency -> "₹ Indian Rupee", date -> "DD-MM-YYYY",
  // tax option -> the enum value itself (plain string options).
  // ---------------------------------------------------------------------
  readonly currencyLabel = (c: Currency) => this.currencyText(c);
  readonly dateFormatLabel = (f: DateFormat) => f.value;
  readonly taxLabel = (t: string) => String(t);

  // ---------------------------------------------------------------------
  // Matching: text key in / value out.
  // currency / dateFormat store full objects (key in, object out);
  // taxOption options are plain enum values, so the key IS the value.
  // ---------------------------------------------------------------------
  readonly currencyValue = (c: Currency) => this.currencyText(c);
  readonly dateFormatValue = (f: DateFormat) => f.value;
  readonly taxValue = (t: string) => String(t);

  currencyKeyOf(value: Currency | null): string | null {
    return value ? this.currencyText(value) : null;
  }

  dateFormatKeyOf(value: DateFormat | null): string | null {
    return value?.value ?? null;
  }

  taxKeyOf(value: unknown): string | null {
    return value != null ? String(value) : null;
  }

  // Only write to the form on a real pick; clearing the text keeps the selection
  onCurrencyValueChange(key: string | null) {
    if (!key) {
      return;
    }
    const match = this.currencyStore.currencies().find((c) => this.currencyText(c) === key);
    if (match) {
      this.InvoiceDetailsForm().get('currency')?.setValue(match);
    }
  }

  onTaxOptionValueChange(key: string | null) {
    if (!key) {
      return;
    }
    const match = this.taxOptions.find((t) => String(t) === key);
    if (match !== undefined) {
      this.InvoiceDetailsForm().get('taxOption')?.setValue(match);
    }
  }

  onDateFormatValueChange(key: string | null) {
    if (!key) {
      return;
    }
    const match = this.dateFormatStore.dateFormat().find((f) => f.value === key);
    if (match) {
      this.InvoiceDetailsForm().get('dateFormat')?.setValue(match);
    }
  }

  // ---------------------------------------------------------------------
  // Panel open/close: reset the search on open, mark touched on close.
  // ---------------------------------------------------------------------
  onCurrencyOpenChange(open: boolean) {
    if (open) {
      this.currencyQuery.set('');
    } else {
      this.InvoiceDetailsForm().get('currency')?.markAsTouched();
    }
  }

  onTaxOptionOpenChange(open: boolean) {
    if (open) {
      this.taxOptionQuery.set('');
    } else {
      this.InvoiceDetailsForm().get('taxOption')?.markAsTouched();
    }
  }

  onDateFormatOpenChange(open: boolean) {
    if (open) {
      this.dateFormatQuery.set('');
    } else {
      this.InvoiceDetailsForm().get('dateFormat')?.markAsTouched();
    }
  }

  invoiceDateValue(field: InvoiceDateField): Date | null {
    return this.coerceDate(this.InvoiceDetailsForm().controls[field].value);
  }

  onInvoiceDateValueChange(field: InvoiceDateField, value: unknown) {
    this.InvoiceDetailsForm().controls[field].setValue(this.coerceDate(value));
  }

  markInvoiceDateTouched(field: InvoiceDateField) {
    this.InvoiceDetailsForm().controls[field].markAsTouched();
  }

  ngOnInit(): void {
    this.currencyStore.loadCurrency();
    this.dateFormatStore.loadDateFormat();
  }

  private coerceDate(value: unknown): Date | null {
    const date = value instanceof Date ? value : typeof value === 'string' ? new Date(value) : null;
    return date && Number.isFinite(date.getTime()) ? date : null;
  }

  private currencyText(c: Currency): string {
    return `${c.symbol} ${c.name}`;
  }

  private stringFields(o: object): string[] {
    return Object.values(o).filter((v): v is string => typeof v === 'string');
  }
}
