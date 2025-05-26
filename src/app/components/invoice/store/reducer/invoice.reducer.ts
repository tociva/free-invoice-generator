import { createReducer, on } from '@ngrx/store';
import * as InvoiceAction from '../actions/invoice.action'
import { initialInvoiceState } from '../state/invoice.state';
export const invoiceReducer = createReducer(
  initialInvoiceState,

  on(InvoiceAction.loadInvoice, (state, { invoice }) => ({
    ...state,
    invoice: invoice
  })),

  on(InvoiceAction.setOrganizationCountry, (state, { country }) => ({
    ...state,
    invoice: { ...state.invoice, organization: { ...state.invoice.organization, country } }
  })),
  on(InvoiceAction.setCustomerCountry, (state, { country }) => ({
    ...state,
    invoice: { ...state.invoice, customer: { ...state.invoice.customer, country } }
  })),
  on(InvoiceAction.setInvoiceDateFormat, (state, { dateFormat }) => ({
    ...state,
    invoice: { ...state.invoice, dateFormat }
  })),
  on(InvoiceAction.setInvoiceCurrency, (state, { currency }) => ({
    ...state,
    invoice: { ...state.invoice, currency }
  })),
  on(InvoiceAction.setInvoiceTaxOption, (state, { option }) => ({
    ...state,
    invoice: { ...state.invoice, taxOption: option }
  })),
  on(InvoiceAction.setInvoiceItemDescription, (state, { itemDescription }) => ({
    ...state,
    invoice: { ...state.invoice, hasItemDescription: itemDescription }
  })),
  on(InvoiceAction.setInvoiceShowDiscount, (state, { showDiscount }) => ({
    ...state,
    invoice: { ...state.invoice, hasItemDiscount: showDiscount }
  })),
);
