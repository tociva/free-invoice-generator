import { createReducer, on } from '@ngrx/store';
import * as TaxActions from '../actions/tax.actions';
import { initialTaxState } from '../state/tax.state';

export const taxReducer = createReducer(
  initialTaxState,

  on(TaxActions.loadTaxesSuccess, (state, { taxes }) => ({
    ...state,
    taxes,
    error: null
  })),

  on(TaxActions.loadTaxesFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(TaxActions.selectTax, (state, { tax }) => ({
    ...state,
    selectedTax: tax
  }))
);
