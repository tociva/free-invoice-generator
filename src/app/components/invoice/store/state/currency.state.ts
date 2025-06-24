import { countries } from '../effects/country-list';
import { Currency } from '../model/currency.model';

const uniqueCurrencies = Array.from(
  new Map(countries.map((c) => [c.currency.name, c.currency])).values()
);
export interface CurrencyState {
  currencies: Currency[];
  selectedCurrency: Currency;
  error: string | null;
}

export const initialCurrencyState: CurrencyState = {
  currencies: uniqueCurrencies,
  selectedCurrency: {
    name: 'Indian Rupee',
    html: '&#8377;',
    unicode: '20B9',
    decimal: 2
  },
  error: null
};
