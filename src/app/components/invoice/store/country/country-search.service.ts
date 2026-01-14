import { Injectable, signal, computed, Signal, WritableSignal } from '@angular/core';
import { Country } from './country.model';

@Injectable({ providedIn: 'root' })
export class CountrySearchService {
  // Major countries that should always be shown
  private readonly majorCountries = new Set<string>([
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Italy', 'Spain', 'Japan', 'China', 'India', 'Brazil',
    'Mexico', 'Russia', 'South Korea', 'Netherlands', 'Sweden', 'Switzerland',
    'Singapore', 'United Arab Emirates', 'Saudi Arabia', 'South Africa',
  ]);

  // Create signals for search state
  createSearchState() {
    const searchTerm = signal<string>('');
    const dropdownOpen = signal<boolean>(false);
    const isEditing = signal<boolean>(false);

    return { searchTerm, dropdownOpen, isEditing };
  }

  // Get filtered countries based on search term
  getFilteredCountries(
    allCountries: readonly Country[],
    searchTerm: string,
    majorCountries?: Set<string>
  ): Country[] {
    const term = searchTerm.toLowerCase().trim();
    const major = majorCountries ?? this.majorCountries;

    if (!term) {
      // Show only major countries when no search term
      return allCountries.filter(c => major.has(c.name));
    }

    // Show all countries that match the search term
    return allCountries.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term)
    );
  }

  // Get computed filtered countries signal
  createFilteredCountriesSignal(
    allCountries: Signal<Country[]>,
    searchTerm: Signal<string>,
    majorCountries?: Set<string>
  ): Signal<Country[]> {
    return computed(() => this.getFilteredCountries(allCountries(), searchTerm(), majorCountries));
  }

  // Get selected country name for display
  getSelectedCountryName(
    selectedCountry: Country | null | undefined,
    searchTerm: string,
    isEditing: boolean
  ): string {
    return isEditing ? searchTerm : (selectedCountry?.name ?? '');
  }

  // Handle country search input
  onCountrySearch(
    event: Event,
    searchTerm: WritableSignal<string>,
    isEditing: WritableSignal<boolean>,
    dropdownOpen: WritableSignal<boolean>
  ): void {
    const input = event.target as HTMLInputElement;
    searchTerm.set(input.value);
    isEditing.set(true);
    dropdownOpen.set(true);
  }

  // Handle country selection
  selectCountry(
    country: Country,
    searchTerm: WritableSignal<string>,
    isEditing: WritableSignal<boolean>,
    dropdownOpen: WritableSignal<boolean>
  ): Country {
    searchTerm.set('');
    isEditing.set(false);
    dropdownOpen.set(false);
    return country;
  }

  // Handle input focus
  onInputFocus(
    selectedCountry: Country | null | undefined,
    searchTerm: WritableSignal<string>,
    isEditing: Signal<boolean>,
    dropdownOpen: WritableSignal<boolean>
  ): void {
    dropdownOpen.set(true);

    // If there's a selected country and user hasn't started editing, show it
    if (selectedCountry && !isEditing()) {
      searchTerm.set(selectedCountry.name);
    }
  }

  // Handle input blur
  onInputBlur(
    selectedCountry: Country | null | undefined,
    searchTerm: WritableSignal<string>,
    isEditing: WritableSignal<boolean>,
    dropdownOpen: WritableSignal<boolean>,
    callback?: (country: Country | null) => void
  ): void {
    setTimeout(() => {
      dropdownOpen.set(false);
      const term = searchTerm().trim();

      if (!selectedCountry && !term) {
        searchTerm.set('');
        isEditing.set(false);
        callback?.(null);
        return;
      }

      if (selectedCountry) {
        searchTerm.set(selectedCountry.name);
        isEditing.set(false);
        return;
      }

      // user typed but didn’t select
      isEditing.set(false);
    }, 200);
  }
}
