import { createReducer, on } from '@ngrx/store';
import { selectCustomer, setCustomerCountry } from '../actions/customer.action';
import { initialCustomerState } from '../state/customer.state';
export const customerReducer = createReducer(
  initialCustomerState,

  on(selectCustomer, (state, { customer }) => ({
    ...state,
    selectedCustomer: customer
  })),
  on(setCustomerCountry, (state, { country }) => ({
    ...state,
    selectedCustomer: { ...state.selectedCustomer, country }
  }))
);
