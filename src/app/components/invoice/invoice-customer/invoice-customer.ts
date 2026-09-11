import {
  TngCardComponent,
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
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TngInput } from '@tailng-ui/primitives';
import { Country, countryFlagClass } from '../store/country/country.model';
import { countryStore } from '../store/country/country.store';
import { CustomerForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [
    TngCardComponent,
    TngInputFieldComponent,
    TngAutocompleteComponent,
    TngInput,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './invoice-customer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./invoice-customer.css'],
})
export class InvoiceCustomerComponent {
  advanced = input<boolean>(false);
  public countryStore = inject(countryStore);

  public InvoiceCustomerForm = input.required<FormGroup<CustomerForm>>();

  // ---------------------------------------------------------------------
  // Country search – same pattern as organization / currency / date format.
  // tng-autocomplete does NOT filter options itself.
  // ---------------------------------------------------------------------
  readonly countryQuery = signal('');

  readonly filteredCountries = computed<readonly Country[]>(() => {
    const q = this.countryQuery().trim().toLowerCase();
    const list = this.countryStore.countries();
    if (!q) {
      return list;
    }
    return list.filter((c) => c.name.toLowerCase().startsWith(q));
  });

  // Display: country name (same as your old dropdown)
  readonly countryLabel = (c: Country) => c.name;

  // String() so a numeric 91 and a string "91" are treated as the same key
  readonly countryValue = (c: Country) => String(c.code);

  readonly countryFlagClass = (country: Country): string =>
    countryFlagClass(country.code);

  // Resolve the form's country object to the store's matching option:
  // by code first (with String() coercion), then by name (covers saved/
  // default objects whose `code` holds the dialing code, e.g. 91 for
  // India). Returns null when nothing matches, so the input shows EMPTY
  // instead of a raw code.
  countryKeyOf(value: Country | null): string | null {
    if (!value) {
      return null;
    }
    const list = this.countryStore.countries();
    const byCode = list.find((c) => String(c.code) === String(value.code));
    const match =
      byCode ?? (value.name ? list.find((c) => c.name === value.name) : undefined);
    return match ? String(match.code) : null;
  }

  // Only write to the form on a real pick; clearing the text keeps the selection
  onCountryValueChange(key: string | null) {
    if (!key) {
      return;
    }
    const match = this.countryStore.countries().find((c) => String(c.code) === String(key));
    if (match) {
      this.InvoiceCustomerForm().get('country')?.setValue(match);
    }
  }

  onCountryOpenChange(open: boolean) {
    if (open) {
      this.countryQuery.set('');
    } else {
      this.InvoiceCustomerForm().get('country')?.markAsTouched();
    }
  }

  ngOnInit(): void {
    this.countryStore.loadCountry();
  }
}