import { createReducer, on } from '@ngrx/store';
import * as InvoiceAction from '../actions/invoice.action'
import { initialInvoiceState } from '../state/invoice.state';
import { reCalculateInvoice } from '../../../../../util/invoice.util';
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
  on(InvoiceAction.deleteInvoiceItem, (state, { index }) => ({
    ...state,
    invoice: { ...state.invoice, items: state.invoice.items.filter((_item, idx) => idx !== index) }
  })),
  on(InvoiceAction.addInvoiceItem, (state, { item }) => ({
    ...state,
    invoice: { ...state.invoice, items: [...state.invoice.items, item] }
  })),
  on(InvoiceAction.updateInvoiceItem, (state, { index, item }) => {
    const updatedItems = state.invoice.items.map((itm, idx) =>{
      if(idx === index) {
        const nItem = {...itm, ...item};
        if(nItem.quantity === 0) {
          return { ...nItem, quantity: 1, itemTotal: nItem.price };
        }
      }
      return {...itm, ...item};
    });
    const invoice = reCalculateInvoice({...state.invoice, items: updatedItems});
  
    return {
      ...state,
      invoice,
    };
  }),
  on(InvoiceAction.updateInvoiceSummaryRoundOff, (state, { roundOff }) => {
      const grandTotal = state.invoice.subTotal + state.invoice.taxTotal + roundOff;
      return {
      ...state,
      invoice: { ...state.invoice, roundOff, grandTotal }
    }}
  ),
  on(InvoiceAction.setInvoiceDate, (state, { date }) => ({
    ...state,
    invoice: { ...state.invoice, date }
  })),
  on(InvoiceAction.setInvoiceDueDate, (state, { dueDate }) => ({
    ...state,
    invoice: { ...state.invoice, dueDate }
  }))
  
);
