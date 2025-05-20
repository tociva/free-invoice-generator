import { Country } from '../model/country.model';

export interface CountryState {
  countries: Country[];
  selectedCountry: Country | null;
  error: string | null;
}

export const initialCountryState: CountryState = {
  countries: [],
  selectedCountry: {
    name: 'India',
    code: '91',
    iso: 'IN',
    currency: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2
    },
    dateformat: {
      name: '31-01-2022',
      value: 'DD-MM-YYYY'
    }
  },
  error: null
};
