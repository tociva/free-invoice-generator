import { createReducer, on } from '@ngrx/store';
import { selectInvoiceDetails } from '../actions/invoice-details.action';
import { initialInvoiceDetailsState } from '../state/invoice-details.state';
export const invoiceDetailsReducer = createReducer(
  initialInvoiceDetailsState,

  on(selectInvoiceDetails, (state, { invoiceDetails }) => ({
    ...state,
    selectedInvoiceDetails: invoiceDetails
  })),
);
