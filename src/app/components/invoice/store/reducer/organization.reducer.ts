import { createReducer, on } from '@ngrx/store';
import { initialOrganizationState } from '../state/organization.state';
import * as OrganizationActions from '../actions/organization.action';

export const organizationReducer = createReducer(
  initialOrganizationState,

  on(OrganizationActions.selectOrganization, (state, { organization }) => ({
    ...state,
    selectedOrganization: organization
  })),

  on(OrganizationActions.setOrganizationCountry, (state, { country }) => ({
    ...state,
    organization: { ...state.organization, country }
  }))
);
