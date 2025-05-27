import { countries } from '../effects/country-list';
import { Country } from '../model/country.model';

export interface CountryState {
  countries: Country[];
  error: string | null;
}

export const initialCountryState: CountryState = {
  countries: countries,
  error: null
};
