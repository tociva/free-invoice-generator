import { createReducer, on } from '@ngrx/store';
import { initialDateFormatState } from '../state/date-format.state';
import * as DateFormatActions from '../actions/date-format.actions';
export const dateFormatReducer = createReducer(
  initialDateFormatState,

  on(DateFormatActions.loadDateFormatsSuccess, (state, { dateFormats }) => ({
    ...state,
    dateFormats,
    error: null
  })),

  on(DateFormatActions.loadDateFormatsFailure, (state, { error }) => ({
    ...state,
    error
  })),
);
