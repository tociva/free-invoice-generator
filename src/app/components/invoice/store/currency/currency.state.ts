import { Currency } from './currency.model';

export interface currencyState {
  currencies: Currency[];
  isLoading: boolean;
  error: string | null;
}
export const initialCurrencyState: currencyState = {
  currencies: [] as Currency[],
  isLoading: false,
  error: null,
};
