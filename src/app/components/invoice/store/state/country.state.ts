import { Country } from '../model/country.model';

export interface CountryState {
  countries: Country[];
  selectedCountry: Country | null;
  error: string | null;
}

export const initialCountryState: CountryState = {
  countries: [],
  selectedCountry: null,
  error: null
};
