import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaxState } from '../state/tax.state';

export const selectTaxFeature = createFeatureSelector<TaxState>('tax');

export const selectAllTaxes = createSelector(
  selectTaxFeature,
  state => state.taxes
);

export const selectSelectedTax = createSelector(
  selectTaxFeature,
  state => state.selectedTax
);

export const selectTaxError = createSelector(
  selectTaxFeature,
  (state: TaxState) => state.error
);
