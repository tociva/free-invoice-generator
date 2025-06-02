import { createReducer, on } from '@ngrx/store';
import * as TemplateActions from '../actions/template.actions';
import { initialTemplateState } from '../state/template.state';

export const templateReducer = createReducer(
  initialTemplateState,

  on(TemplateActions.loadTemplatesSuccess, (state, { templates }) => ({
    ...state,
    templates,
    error: null
  })),

  on(TemplateActions.loadTemplatesFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
