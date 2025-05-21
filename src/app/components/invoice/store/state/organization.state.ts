import { Organization } from '../model/organization.model';

export interface OrganizationState {
  selectedOrganization: Organization | null;
  error: string | null;
}

export const initialOrganizationState: OrganizationState = {
  selectedOrganization: {
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
