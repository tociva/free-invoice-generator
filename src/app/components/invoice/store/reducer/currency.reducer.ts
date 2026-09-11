import { createReducer, on } from '@ngrx/store';
import { initialCurrencyState } from '../state/currency.state';
import * as CurrencyActions from '../actions/currency.actions';
export const currencyReducer = createReducer(
  initialCurrencyState,

  on(CurrencyActions.loadCurrenciesSuccess, (state, { currencies }) => ({
    ...state,
    currencies,
    error: null
  })),

  on(CurrencyActions.loadCurrenciesFailure, (state, { error }) => ({
    ...state,
    error
  })),
);
