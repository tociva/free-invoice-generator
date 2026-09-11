import { createAction, props } from '@ngrx/store';

export const loadTaxes = createAction('[Tax] Load Taxes');
export const loadTaxesSuccess = createAction(
  '[Tax] Load Taxes Success',
  props<{ taxes: string[] }>()
);
export const loadTaxesFailure = createAction(
  '[Tax] Load Taxes Failure',
  props<{ error: string }>()
);

export const selectTax = createAction(
  '[Tax] Select Tax',
  props<{ tax: string }>()
);
