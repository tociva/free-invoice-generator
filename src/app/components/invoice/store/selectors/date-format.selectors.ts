import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DateFormatState } from '../state/date-format.state';

export const selectDateFormatFeature = createFeatureSelector<DateFormatState>('dateFormat');

export const selectAllDateFormats = createSelector(
  selectDateFormatFeature,
  (state: DateFormatState) => state.dateFormats
);

export const selectDateFormatError = createSelector(
  selectDateFormatFeature,
  (state: DateFormatState) => state.error
);
