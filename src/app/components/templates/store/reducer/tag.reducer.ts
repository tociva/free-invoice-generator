import { createReducer, on } from '@ngrx/store';
import * as TagActions from '../actions/tag.actions';
import { TagState, initialTagState } from '../state/tag.state';

export const tagReducer = createReducer(
  initialTagState,
  on(TagActions.loadTags, (state, { tags }) => ({
    ...state,
    tags: [...tags],
    error: null
  })),
  on(TagActions.loadTagsFailure, (state, { error }) => ({
    ...state,
    error
  })),
);
