import { createAction, props } from '@ngrx/store';
import { Invoice, TaxOption } from '../model/invoice.model';
import { Country } from '../model/country.model';
import { DateFormat } from '../model/date-format.model';
import { Currency } from '../model/currency.model';

export const loadInvoice = createAction(
  '[Invoice] Load Invoice',
    props<{ invoice: Invoice }>()
);
export const loadInvoiceSuccess = createAction(
  '[Invoice] Load Invoice Success',
  props<{ invoice: Invoice }>()
);
export const loadInvoiceDetailsFailure = createAction(
  '[InvoiceDetails] Load InvoiceDetails Failure',
  props<{ error: string }>()
);

export const setOrganizationCountry = createAction(
  '[Organization] Set Organization Country',
  props<{ country: Country }>()
);

export const setCustomerCountry = createAction(
  '[Customer] Set Customer Country',
  props<{ country: Country }>()
);

export const setInvoiceDateFormat = createAction(
  '[Invoice] Set Invoice Date Format',
  props<{ dateFormat: DateFormat }>()
);

export const setInvoiceCurrency = createAction(
  '[Invoice] Set Invoice Currency',
  props<{ currency: Currency }>()
);

export const setInvoiceTaxOption = createAction(
  '[Invoice] Set Invoice Tax Option',
  props<{ option: TaxOption }>()
);

export const setInvoiceItemDescription = createAction(
  '[Invoice] Set Invoice Item Description',
  props<{ itemDescription: boolean }>()
);

export const setInvoiceShowDiscount = createAction(
  '[Invoice] Set Invoice Show Discount',
  props<{ showDiscount: boolean }>()
);
