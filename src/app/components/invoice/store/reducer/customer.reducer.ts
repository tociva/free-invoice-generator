import { createReducer, on } from '@ngrx/store';
import { selectCustomer } from '../actions/customer.action';
import { initialCustomerState } from '../state/customer.state';
export const customerReducer = createReducer(
  initialCustomerState,

  on(selectCustomer, (state, { customer }) => ({
    ...state,
    selectedCustomer: customer
  }))
);
