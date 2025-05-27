import { createReducer, on } from '@ngrx/store';
import * as InvoiceDetailsAction from '../actions/invoice-details.action';
import { initialInvoiceDetailsState } from '../state/invoice-details.state';
export const invoiceDetailsReducer = createReducer(
  initialInvoiceDetailsState,

  on(InvoiceDetailsAction.selectInvoiceDetails, (state, { invoiceDetails }) => ({
    ...state,
    selectedInvoiceDetails: invoiceDetails
  })),
  on(InvoiceDetailsAction.setInvoiceDetailsDecimalPlaces, (state, { decimalPlaces }) => ({
    ...state,
    selectedInvoiceDetails: { ...state.selectedInvoiceDetails, decimalPlaces }
  }))
);
