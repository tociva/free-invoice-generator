import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialDateFormatState } from './date-format.state';
import { DateFormat } from './date-format.model';
import { dateFormats } from './date-format.data';

export const dateFormatStore = signalStore(
  withState(initialDateFormatState),
  withMethods((store) => ({
    loadDateFormat() {
      patchState(store, { isLoading: true, error: null });
      setTimeout(() => this.loadDateFormatSuccess(dateFormats), 500);
    },
    loadDateFormatSuccess(data: DateFormat[]) {
      patchState(store, { dateFormat: data, isLoading: false, error: null });
    },
    loadDateFormatError(errorMessage: string) {
      patchState(store, { dateFormat: [], isLoading: false, error: errorMessage });
    },
  }))
);
