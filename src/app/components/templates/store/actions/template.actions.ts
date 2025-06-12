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

export const setSearchTags = createAction(
  '[Template] Set Search Tags',
  props<{ searchTags: string[] }>()
);

export const addSearchTag = createAction(
  '[Template] Add Search Tag',
  props<{ tag: string }>()
);

export const removeSearchTag = createAction(
  '[Template] Remove Search Tag',
  props<{ tag: string }>()
);

export const clearSearchTags = createAction(
  '[Template] Clear Search Tags'
);
export const setSelectedTemplate = createAction(
  '[Template] Set Selected Template',
  props<{ selectedTemplate: TemplateItem }>()
);
