import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurrencyState } from '../state/currency.state';

export const selectCurrencyFeature = createFeatureSelector<CurrencyState>('currency');

export const selectAllCurrencies = createSelector(
  selectCurrencyFeature,
  (state: CurrencyState) => state.currencies
);

export const selectCurrencyError = createSelector(
  selectCurrencyFeature,
  (state: CurrencyState) => state.error
);
