import {
  TngCardComponent,
  TngInputFieldComponent,
  TngTooltipComponent,
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
import { Country } from '../store/country/country.model';
import { countryStore } from '../store/country/country.store';
import { OrganizationForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-organization',
  standalone: true,
  imports: [
    TngTooltipComponent,
    TngCardComponent,
    TngInputFieldComponent,
    TngAutocompleteComponent,
    TngInput,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './invoice-organization.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./invoice-organization.css'],
})
export class InvoiceOrganizationComponent {
  advanced = input<boolean>(false);
  public countryStore = inject(countryStore);

  public InvoiceOrganizationForm = input.required<FormGroup<OrganizationForm>>();

  // ---------------------------------------------------------------------
  // Country search – same pattern as customer / currency / date format.
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

  readonly countryLabel = (c: Country) => c.name;

  // String() so a numeric 91 and a string "91" are treated as the same key
  readonly countryValue = (c: Country) => String(c.code);

  // ---------------------------------------------------------------------
  // Resolve the form's country object to the store's matching option:
  // first by code, then by name (covers default/saved objects whose `code`
  // holds the dialing code, e.g. 91 for India). Returns null when nothing
  // matches, so the input shows EMPTY instead of a raw code.
  // ---------------------------------------------------------------------
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

  onCountryValueChange(key: string | null) {
    if (!key) {
      return;
    }
    const match = this.countryStore.countries().find((c) => String(c.code) === String(key));
    if (match) {
      this.InvoiceOrganizationForm().get('country')?.setValue(match);
    }
  }

  onCountryOpenChange(open: boolean) {
    if (open) {
      this.countryQuery.set('');
    } else {
      this.InvoiceOrganizationForm().get('country')?.markAsTouched();
    }
  }

  ngOnInit(): void {
    this.countryStore.loadCountry();
  }
}
