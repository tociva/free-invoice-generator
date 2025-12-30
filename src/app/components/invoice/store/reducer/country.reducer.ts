import { createReducer, on } from '@ngrx/store';
import * as CountryActions from '../actions/country.actions';
import { initialCountryState } from '../state/country.state';

export const countryReducer = createReducer(
  initialCountryState,

  on(CountryActions.loadCountriesSuccess, (state, { countries }) => ({
    ...state,
    countries,
    error: null
  })),

  on(CountryActions.loadCountriesFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
