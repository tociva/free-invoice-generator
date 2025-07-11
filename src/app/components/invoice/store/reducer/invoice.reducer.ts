import { createReducer, on } from '@ngrx/store';
import * as InvoiceAction from '../actions/invoice.action';
import { initialInvoiceState } from '../state/invoice.state';
import { currencyToFixedNumber, formatItemValues, reCalculateInvoice } from '../../../../../util/invoice.util';
import { DEFAULT_DECIMAL_PLACES } from '../../../../../util/constants';
import { InvoiceItem } from '../model/invoice.model';
export const invoiceReducer = createReducer(
  initialInvoiceState,

  on(InvoiceAction.loadInvoice, (state, { invoice }) => ({
    ...state,
    invoice
  })),
  on(InvoiceAction.patchInvoiceDetails, (state, { details }) => {
    const invoice = reCalculateInvoice({...state.invoice, ...details});
    return {
      ...state,
      invoice
    };
  }),
  on(InvoiceAction.patchOrganization, (state, { organization }) => {
    const organizationTemp = {...state.invoice.organization, ...organization};
    const invoice = {...state.invoice, organization: organizationTemp};
    return {
      ...state,
      invoice
    };
  }),
  on(InvoiceAction.setOrganizationCountry, (state, { country }) => ({
    ...state,
    invoice: { ...state.invoice, organization: { ...state.invoice.organization, country } }
  })),
  on(InvoiceAction.patchCustomer, (state, { customer }) => {
    const customerTemp = {...state.invoice.customer, ...customer};
    const invoice = {...state.invoice, customer: customerTemp};
    return {
      ...state,
      invoice
    };
  }),
  on(InvoiceAction.setCustomerCountry, (state, { country }) => {
    const numbering = !['India', 'Pakistan', 'Bangladesh'].includes(country.name);
    return {
    ...state,
    invoice: { ...state.invoice, customer: { ...state.invoice.customer, country }, 
    currency: country.currency, 
    decimalPlaces: country.currency.decimal,
    dateFormat: country.dateFormat,
    internationalNumbering: numbering
  }
  };}),
  on(InvoiceAction.setInvoiceTaxOption, (state, { option }) => {
    const { items } = state.invoice;
    const itemsTemp:InvoiceItem[] = [];
    items.forEach((item) => {
      itemsTemp.push({...item, tax1Percentage: 0, tax2Percentage: 0, tax3Percentage: 0, tax1Amount: 0, tax2Amount: 0, tax3Amount: 0});
    });
    const invoice = reCalculateInvoice({...state.invoice, items: itemsTemp});
    return {
      ...state,
      invoice: { ...invoice, taxOption: option }
    };
  }),
  on(InvoiceAction.setInvoiceShowDiscount, (state, { showDiscount }) => {
    const { items } = state.invoice;
    const itemsTemp:InvoiceItem[] = [];
    items.forEach((item) => {
      itemsTemp.push({...item, discPercentage: 0, discountAmount: 0});
    });
    const invoice = reCalculateInvoice({...state.invoice, items: itemsTemp});
    return {
      ...state,
      invoice: { ...invoice, hasItemDiscount: showDiscount }
    };
  }),
  on(InvoiceAction.deleteInvoiceItem, (state, { index }) => {
    const items = state.invoice.items.filter((_item, idx) => idx !== index);
    const invoice = reCalculateInvoice({...state.invoice, items});
    return {
      ...state,
      invoice: { ...invoice }
    };
  }),
  on(InvoiceAction.addInvoiceItem, (state, { item }) => ({
    ...state,
    invoice: { ...state.invoice, items: [...state.invoice.items, item] }
  })),
  on(InvoiceAction.updateInvoiceItem, (state, { index, item: itemNew }) => {

    const decimalPlaces = state.invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
    const updatedItems = state.invoice.items.map((itmOld, idx) => {
      if(idx === index) {
        const nItem = {...itmOld, ...itemNew};
        if(nItem.quantity === 0) {
          return formatItemValues({ ...nItem, quantity: 1, price: nItem.price ?? 0, itemTotal: nItem.price ?? 0 }, decimalPlaces);
        }
        return formatItemValues(nItem, decimalPlaces);
      }
      return formatItemValues(itmOld, decimalPlaces);
    });
    const invoice = reCalculateInvoice({...state.invoice, items: updatedItems});

    return {
      ...state,
      invoice,
    };
  }),
  on(InvoiceAction.updateInvoiceSummaryRoundOff, (state, { roundOff }) => {
    const decimalPlaces = state.invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
    const nRoundOff = currencyToFixedNumber(roundOff, decimalPlaces);
    const grandTotal = currencyToFixedNumber(state.invoice.subTotal + state.invoice.taxTotal + nRoundOff, decimalPlaces);
      return {
      ...state,
      invoice: { ...state.invoice, roundOff: nRoundOff, grandTotal }
    };
  })
);
