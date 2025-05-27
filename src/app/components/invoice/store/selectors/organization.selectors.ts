import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrganizationState } from '../state/organization.state';

export const selectOrganizationFeature = createFeatureSelector<OrganizationState>('organization');

export const selectSelectedOrganization = createSelector(
  selectOrganizationFeature,
  state => state.organization
);

export const selectOrganizationError = createSelector(
  selectOrganizationFeature,
  state => state.error
);

export const selectOrganizationCountry = createSelector(
  selectOrganizationFeature,
  state => state.organization.country
);
