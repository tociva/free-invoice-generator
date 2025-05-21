import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrganizationState } from '../state/organization.state';

export const selectOrganizationFeature = createFeatureSelector<OrganizationState>('organization');

export const selectSelectedOrganization = createSelector(
  selectOrganizationFeature,
  state => state.selectedOrganization
);

export const selectOrganizationError = createSelector(
  selectOrganizationFeature,
  state => state.error
);
