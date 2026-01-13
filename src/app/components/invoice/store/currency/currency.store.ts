import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialCurrencyState } from './currency.state';
import { Currency } from './currency.model';
import { currencies } from './currency.data';

export const currencyStore = signalStore(
  withState(initialCurrencyState),
  withMethods((store) => ({
    loadCurrency() {
      patchState(store, { isLoading: true, error: null });
      setTimeout(() => this.loadCurrencySuccess(currencies), 500);
    },
    loadCurrencySuccess(data: Currency[]) {
      patchState(store, { currencies: data, isLoading: false, error: null });
    },
  }))
);

