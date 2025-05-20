import { createAction, props } from '@ngrx/store';
import { Currency } from '../model/currency.model';

export const loadCurrencies = createAction('[Currency] Load Currencies');
export const loadCurrenciesSuccess = createAction(
  '[Currency] Load Currencies Success',
  props<{ currencies: Currency[] }>()
);
export const loadCurrenciesFailure = createAction(
  '[Currency] Load Currencies Failure',
  props<{ error: string }>()
);

export const selectCurrency = createAction(
  '[Currency] Select Currency',
  props<{ currency: Currency }>()
);
