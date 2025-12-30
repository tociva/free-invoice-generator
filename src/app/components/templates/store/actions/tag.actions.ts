import { createAction, props } from '@ngrx/store';

export const loadTags = createAction(
  '[Tag] Load Tags',
  props<{ tags: string[] }>()
);

export const loadTagsFailure = createAction(
  '[Tag] Load Tags Failure',
  props<{ error: string }>()
);
