import { Component, inject, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerForm } from '../store/models/invoice-form.model';
import { countryStore } from '../store/country/country.store';
import { Country } from '../store/country/country.model';
import { CountrySearchService } from '../store/country/country-search.service';

@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './invoice-customer.html',
  styleUrls: ['./invoice-customer.css'],
})
export class InvoiceCustomerComponent {
  advanced = input<boolean>(false);
  public countryStore = inject(countryStore);
  private countrySearchService = inject(CountrySearchService);
  
  // Create search state using the service
  private searchState = this.countrySearchService.createSearchState();
  countrySearchTerm = this.searchState.searchTerm;
  countryDropdownOpen = this.searchState.dropdownOpen;
  isEditingCountry = this.searchState.isEditing;
  
  // Filtered countries using the service
  filteredCountries = this.countrySearchService.createFilteredCountriesSignal(
    this.countryStore.countries,
    this.countrySearchTerm
  );
  
  ngOnInit(): void {
    this.countryStore.loadCountry();
  }

  public InvoiceCustomerForm = input.required<FormGroup<CustomerForm>>();
  
  // Get selected country from form
  get selectedCountry(): Country | null {
    return this.InvoiceCustomerForm().get('country')?.value ?? null;
  }
  
  // Expose service methods directly with form integration
  onCountrySearch = (event: Event) => 
    this.countrySearchService.onCountrySearch(event, this.countrySearchTerm, this.isEditingCountry, this.countryDropdownOpen);
  
  selectCountry = (country: Country) => {
    const selected = this.countrySearchService.selectCountry(country, this.countrySearchTerm, this.isEditingCountry, this.countryDropdownOpen);
    this.InvoiceCustomerForm().patchValue({ country: selected });
  };
  
  getSelectedCountryName = () => 
    this.countrySearchService.getSelectedCountryName(this.selectedCountry, this.countrySearchTerm(), this.isEditingCountry());
  
  onInputFocus = () => 
    this.countrySearchService.onInputFocus(this.selectedCountry, this.countrySearchTerm, this.isEditingCountry, this.countryDropdownOpen);
  
  onInputBlur = () => 
    this.countrySearchService.onInputBlur(this.selectedCountry, this.countrySearchTerm, this.isEditingCountry, this.countryDropdownOpen);
}
