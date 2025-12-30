import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvoiceState } from '../state/invoice.state';

export const selectInvoiceFeature = createFeatureSelector<InvoiceState>('invoice');

export const selectInvoice = createSelector(
  selectInvoiceFeature,
  (state: InvoiceState) => state.invoice
);

export const selectInvoiceError = createSelector(
  selectInvoiceFeature,
  (state: InvoiceState) => state.error
);
