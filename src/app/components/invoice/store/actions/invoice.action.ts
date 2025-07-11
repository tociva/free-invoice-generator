import { createAction, props } from '@ngrx/store';
import { Country } from '../model/country.model';
import { Customer, Invoice, InvoiceItem, Organization, TaxOption } from '../model/invoice.model';

export const loadInvoice = createAction(
  '[Invoice] Load Invoice',
    props<{ invoice: Invoice }>()
);
export const loadInvoiceSuccess = createAction(
  '[Invoice] Load Invoice Success',
  props<{ invoice: Invoice }>()
);

export const patchInvoiceDetails = createAction(
  '[InvoiceDetails] Patch Invoice Details',
  props<{ details: Partial<Invoice> }>()
);

export const patchOrganization = createAction(
  '[Organization] Patch Organization',
  props<{ organization: Partial<Organization> }>()
);

export const setOrganizationCountry = createAction(
  '[Organization] Set Organization Country',
  props<{ country: Country }>()
);

export const patchCustomer = createAction(
  '[Customer] Patch Customer',
  props<{ customer: Partial<Customer> }>()
);

export const setCustomerCountry = createAction(
  '[Customer] Set Customer Country',
  props<{ country: Country }>()
);

export const setInvoiceTaxOption = createAction(
  '[Invoice] Set Invoice Tax Option',
  props<{ option: TaxOption }>()
);

export const setInvoiceShowDiscount = createAction(
  '[Invoice] Set Invoice Show Discount',
  props<{ showDiscount: boolean }>()
);

export const deleteInvoiceItem = createAction(
  '[Invoice] Delete Invoice Item',
  props<{ index: number }>()
);

export const addInvoiceItem = createAction(
  '[Invoice] Add Invoice Item',
  props<{ item: InvoiceItem }>()
);

export const updateInvoiceItem = createAction(
  '[Invoice] Update Invoice Item',
  props<{ index: number, item: InvoiceItem }>()
);

export const updateInvoiceSummaryRoundOff = createAction(
  '[Invoice] Update Invoice Summary Round Off',
  props<{ roundOff: number }>()
);