import { Currency } from '../model/currency.model';

export interface CurrencyState {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  error: string | null;
}

export const initialCurrencyState: CurrencyState = {
  currencies: [],
  selectedCurrency: {
    name: 'Indian Rupee',
    html: '&#8377;',
    unicode: '20B9',
    decimal: 2
  },
  error: null
};
