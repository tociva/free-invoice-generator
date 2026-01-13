import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialCountryState } from './country.state';
import { countries } from './country.data';
import { Country } from './country.model';

export const countryStore = signalStore(
  withState(initialCountryState),
  withMethods((store) => ({
    loadCountry() {
      patchState(store, { isLoading: true, error: null });
      setTimeout(() => this.loadCountrySuccess(countries), 500);
    },

    loadCountrySuccess(data: Country[]) {
      patchState(store, { countries: data, isLoading: false, error: null });
    },

    loadCountryError(errorMessage: string) {
      patchState(store, { countries: [], isLoading: false, error: errorMessage });
    },
  }))
);
