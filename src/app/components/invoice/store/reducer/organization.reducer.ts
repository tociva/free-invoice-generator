import { createReducer, on } from '@ngrx/store';
import { initialOrganizationState } from '../state/organization.state';
import { selectOrganization } from '../actions/organization.action';

export const organizationReducer = createReducer(
  initialOrganizationState,

  on(selectOrganization, (state, { organization }) => ({
    ...state,
    selectedOrganization: organization
  }))
);
