import { createAction, props } from '@ngrx/store';
import { Customer } from '../model/customer.model';
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
