import { createAction, props } from '@ngrx/store';
import { Organization } from '../model/organization.model';
import { Country } from '../model/country.model';

export const loadOrganization = createAction('[Organization] Load Organization');
export const loadOrganizationSuccess = createAction(
  '[Organization] Load Organization Success',
  props<{ organization: Organization[] }>()
);
export const loadOrganizationFailure = createAction(
  '[Organization] Load Organization Failure',
  props<{ error: string }>()
);

export const selectOrganization = createAction(
  '[Organization] Select Organization',
  props<{ organization: Organization }>()
);

export const setOrganizationCountry = createAction(
  '[Organization] Set Organization Country',
  props<{ country: Country }>()
);
