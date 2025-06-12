import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TemplateState } from '../state/template.state';

export const selectTemplateState = createFeatureSelector<TemplateState>('template');
export const selectTemplateFeature = createFeatureSelector<TemplateState>('template');

export const selectAllTemplates = createSelector(
  selectTemplateFeature,
  (state) => state.templates
);

export const selectTemplateError = createSelector(
  selectTemplateFeature,
  (state) => state.error
);

export const selectTemplateItems = createSelector(
  selectTemplateFeature,
  (state) => state.templateItems
);

export const selectCurrentPage = createSelector(
  selectTemplateFeature,
  (state) => state.currentPage
);

export const selectPageSize = createSelector(
  selectTemplateFeature,
  (state) => state.pageSize
);

export const selectSearchTags = createSelector(
  selectTemplateFeature,
  (state) => state.searchTags
);

export const selectFilteredTemplateItems = createSelector(
  selectTemplateItems,
  selectSearchTags,
  (items, searchTags) => {
    if (!searchTags.length) {return items;}

    return items.filter((item) =>
      item.tags?.some((tag) => searchTags.includes(tag))
    );
  }
);

export const selectPaginatedTemplateItems = createSelector(
  selectFilteredTemplateItems,
  selectCurrentPage,
  selectPageSize,
  (items, currentPage, pageSize) =>
    items.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
);

export const selectFilteredTemplateItemCount = createSelector(
  selectFilteredTemplateItems,
  (items) => items.length
);

export const selectFilteredTemplateItemsAllConditions = createSelector(
  selectTemplateItems,
  selectSearchTags,
  (items, searchTags) => {
    if (!searchTags.length) {return items;}

    return items.filter((item) =>
      searchTags?.every((tag) => item.tags.includes(tag))
    );
  }
);

export const selectPaginatedTemplateItemsAllConditions = createSelector(
  selectFilteredTemplateItemsAllConditions,
  selectCurrentPage,
  selectPageSize,
  (items, currentPage, pageSize) =>
    items.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
);

export const selectFilteredTemplateItemCountAllConditions = createSelector(
  selectFilteredTemplateItemsAllConditions,
  (items) => items.length
);

export const selectSelectedTemplate = createSelector(
  selectTemplateState,
  (state) => state.selectedTemplate
);
