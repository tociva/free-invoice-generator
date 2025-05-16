import { createReducer, on } from '@ngrx/store';
import { CountryState, initialCountryState } from '../state/country.state';
import * as CountryActions from '../actions/country.actions';

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
  })),

  on(CountryActions.selectCountry, (state, { country }) => ({
    ...state,
    selectedCountry: country
  }))
);
