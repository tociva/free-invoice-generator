import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CountryState } from '../state/country.state';

export const selectCountryFeature = createFeatureSelector<CountryState>('country');

export const selectAllCountries = createSelector(
  selectCountryFeature,
  state => state.countries
);

export const selectCountryError = createSelector(
  selectCountryFeature,
  state => state.error
);
