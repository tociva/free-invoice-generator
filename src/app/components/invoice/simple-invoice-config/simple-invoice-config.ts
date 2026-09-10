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
import { TngAutocompleteComponent } from '@tailng-ui/components';
import { Currency } from '../store/currency/currency.model';
import { currencyStore } from '../store/currency/currency.store';
import { DateFormat } from '../store/date-format/date-format.model';
import { dateFormatStore } from '../store/date-format/date-format.store';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-simple-invoice-config',
  standalone: true,
  imports: [TngAutocompleteComponent, ReactiveFormsModule],
  templateUrl: './simple-invoice-config.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styleUrls: ['./simple-invoice-config.css'],
})
export class SimpleInvoiceConfig implements OnInit {

  public currencyStore = inject(currencyStore);
  public dateFormatStore = inject(dateFormatStore);

  InvoiceConfiq = input.required<FormGroup<InvoiceForm>>();
  ngOnInit() {
    this.currencyStore.loadCurrency();
    this.dateFormatStore.loadDateFormat();
  }

  readonly currencyQuery = signal('');
  readonly dateFormatQuery = signal('');

  readonly filteredCurrencies = computed<readonly Currency[]>(() => {
    const q = this.currencyQuery().trim().toLowerCase();
    const list = this.currencyStore.currencies();
    if (!q) {
      return list;
    }
    return list.filter((c) =>
      this.stringFields(c).some((t) => t.toLowerCase().startsWith(q)),
    );
  });

  readonly filteredDateFormats = computed<readonly DateFormat[]>(() => {
    const q = this.dateFormatQuery().trim().toLowerCase();
    const list = this.dateFormatStore.dateFormat();
    if (!q) {
      return list;
    }
    return list.filter((f) => this.dateFormatLabel(f).toLowerCase().startsWith(q));
  });

  readonly currencyLabel = (c: Currency) => this.currencyText(c);
  readonly dateFormatLabel = (f: DateFormat) => f.value;

  readonly currencyValue = (c: Currency) => this.currencyText(c);
  readonly dateFormatValue = (f: DateFormat) => f.value;

  currencyKeyOf(value: Currency | null): string | null {
    return value ? this.currencyText(value) : null;
  }

  dateFormatKeyOf(value: DateFormat | null): string | null {
    return value?.value ?? null;
  }

  onCurrencyValueChange(key: string | null) {
    const match = this.currencyStore.currencies().find((c) => this.currencyText(c) === key);
    this.InvoiceConfiq().get('currency')?.setValue(match ?? null);
  }

  onDateFormatValueChange(key: string | null) {
    const match = this.dateFormatStore.dateFormat().find((f) => f.value === key);
    this.InvoiceConfiq().get('dateFormat')?.setValue(match ?? null);
  }


  private currencyText(c: Currency): string {
    return `${c.symbol} ${c.name}`;
  }

  private stringFields(o: object): string[] {
    return Object.values(o).filter((v): v is string => typeof v === 'string');
  }

  onCurrencyOpenChange(open: boolean) {
    if (open) {
      this.currencyQuery.set('');
    } else {
      this.InvoiceConfiq().get('currency')?.markAsTouched();
    }
  }

  onDateFormatOpenChange(open: boolean) {
    if (open) {
      this.dateFormatQuery.set('');
    } else {
      this.InvoiceConfiq().get('dateFormat')?.markAsTouched();
    }
  }
}
