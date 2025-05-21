import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CustomerState } from '../state/customer.state';

export const selectCustomerFeature = createFeatureSelector<CustomerState>('customer');

export const selectSelectedCustomer = createSelector(
  selectCustomerFeature,
  (state: CustomerState) => state.selectedCustomer
);

export const selectCustomerError = createSelector(
  selectCustomerFeature,
  (state: CustomerState) => state.error
);
