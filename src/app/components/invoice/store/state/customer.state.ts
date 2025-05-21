import { Customer } from '../model/customer.model';

export interface CustomerState {
  selectedCustomer: Customer | null;
  error: string | null;
}

export const initialCustomerState: CustomerState = {
  selectedCustomer: {
    name: 'Tociva Technologies',
    mobile: '1234567890',
    email: 'info@tociva.com',
    gstin: '1234567890',
    line1: '123 Main St',
    line2: 'St.Louis, MO',
    street: 'Carolina St',
    city: 'St.Louis, MO',
    state: 'Missouri',
    zip: '63101'
  },
  error: null
};
