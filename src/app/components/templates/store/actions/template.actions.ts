import { createAction, props } from '@ngrx/store';
import { Template, TemplateItem } from '../model/template.model';

// Load templates (metadata only)
export const loadTemplates = createAction('[Template] Load Templates');

export const loadTemplatesSuccess = createAction(
  '[Template] Load Templates Success',
  props<{ templates: Template[]; templateItems: TemplateItem[] }>()
);

export const loadTemplatesFailure = createAction(
  '[Template] Load Templates Failure',
  props<{ error: string }>()
);

export const setPagination = createAction(
  '[Template] Set Pagination',
  props<{ currentPage: number; pageSize: number }>()
);

