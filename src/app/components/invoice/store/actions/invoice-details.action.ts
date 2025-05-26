import { createAction, props } from '@ngrx/store';
import { InvoiceDetails } from '../model/invoice-details.model';
export const loadInvoiceDetails = createAction('[InvoiceDetails] Load InvoiceDetails');
export const loadInvoiceDetailsSuccess = createAction(
  '[InvoiceDetails] Load InvoiceDetails Success',
  props<{ invoiceDetails: InvoiceDetails }>()
);
export const loadInvoiceDetailsFailure = createAction(
  '[InvoiceDetails] Load InvoiceDetails Failure',
  props<{ error: string }>()
);

export const selectInvoiceDetails = createAction(
  '[InvoiceDetails] Select InvoiceDetails',
    props<{ invoiceDetails: InvoiceDetails }>()
);

export const setInvoiceDetailsDecimalPlaces = createAction(
  '[InvoiceDetails] Set InvoiceDetails Decimal Places',
  props<{ decimalPlaces: number }>()
);
