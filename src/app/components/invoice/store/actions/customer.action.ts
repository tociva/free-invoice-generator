import { createAction, props } from '@ngrx/store';
import { Customer } from '../model/customer.model';
import { Country } from '../model/country.model';
export const loadCustomer = createAction('[Customer] Load Customer');
export const loadCustomerSuccess = createAction(
  '[Customer] Load Customer Success',
  props<{ customer: Customer[] }>()
);
export const loadCustomerFailure = createAction(
  '[Customer] Load Customer Failure',
  props<{ error: string }>()
);

export const selectCustomer = createAction(
  '[Customer] Select Customer',
    props<{ customer: Customer }>()
);

export const setCustomerCountry = createAction(
  '[Customer] Set Customer Country',
  props<{ country: Country }>()
);
