import { createReducer, on } from '@ngrx/store';
import * as TemplateActions from '../actions/template.actions';
import { initialTemplateState } from '../state/template.state';

export const templateReducer = createReducer(
  
  initialTemplateState,
  

  on(TemplateActions.setPagination, (state, { currentPage, pageSize }) => ({
    ...state,
    currentPage,
    pageSize
  })),
  
  on(TemplateActions.loadTemplatesSuccess, (state, { templates, templateItems }) => ({
    ...state,
    templates,
    templateItems,
    totalCount: templateItems.length,
    error: null
  })),

  on(TemplateActions.loadTemplatesFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(TemplateActions.setSearchTags, (state, { searchTags }) => ({
    ...state,
    searchTags
  })),
  on(TemplateActions.addSearchTag, (state, { tag }) => ({
    ...state,
    searchTags: state.searchTags.includes(tag)
      ? state.searchTags
      : [...state.searchTags, tag]
  })),
  
  on(TemplateActions.removeSearchTag, (state, { tag }) => ({
    ...state,
    searchTags: state.searchTags.filter((t) => t !== tag)
  })),
  
  on(TemplateActions.clearSearchTags, (state) => ({
    ...state,
    searchTags: []
  })),
  on(TemplateActions.setSelectedTemplate, (state, { selectedTemplate }) => ({
  ...state,
  selectedTemplate
}))

);
