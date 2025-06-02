import { createAction, props } from '@ngrx/store';
import { Template } from '../model/template.model';

export const loadTemplates = createAction('[Template] Load Templates');
export const loadTemplatesSuccess = createAction(
  '[Template] Load Templates Success',
  props<{ templates: Template[] }>()
);
export const loadTemplatesFailure = createAction(
  '[Template] Load Templates Failure',
  props<{ error: string }>()
);
