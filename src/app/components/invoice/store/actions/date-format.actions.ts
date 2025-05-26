import { createAction, props } from '@ngrx/store';
import { Currency } from '../model/currency.model';
import { DateFormat } from '../model/date-format.model';

export const loadDateFormats = createAction('[DateFormat] Load Date Formats');
export const loadDateFormatsSuccess = createAction(
  '[DateFormat] Load Date Formats Success',
  props<{ dateFormats: DateFormat[] }>()
);
export const loadDateFormatsFailure = createAction(
  '[DateFormat] Load Date Formats Failure',
  props<{ error: string }>()
);
