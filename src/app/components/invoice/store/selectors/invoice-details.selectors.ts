import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvoiceDetailsState } from '../state/invoice-details.state';

export const selectInvoiceDetailsFeature = createFeatureSelector<InvoiceDetailsState>('invoiceDetails');

export const selectSelectedInvoiceDetails = createSelector(
  selectInvoiceDetailsFeature,
  (state: InvoiceDetailsState) => state.selectedInvoiceDetails
);

export const selectInvoiceDetailsError = createSelector(
  selectInvoiceDetailsFeature,
  (state: InvoiceDetailsState) => state.error
);
