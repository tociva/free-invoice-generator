import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TagState } from '../state/tag.state';

// Feature selector for the 'tags' slice
export const selectTagState = createFeatureSelector<TagState>('tags');

// Selector for tags array
export const selectTags = createSelector(
  selectTagState,
  (state: TagState) => state.tags
);

// Selector for tag error (optional)
export const selectTagError = createSelector(
  selectTagState,
  (state: TagState) => state.error
);
