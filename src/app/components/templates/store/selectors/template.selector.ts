import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TemplateState } from '../state/template.state';

export const selectTemplateFeature = createFeatureSelector<TemplateState>('template');

export const selectAllTemplates = createSelector(
  selectTemplateFeature,
  state => state.templates
);

export const selectTemplateError = createSelector(
  selectTemplateFeature,
  state => state.error
);
