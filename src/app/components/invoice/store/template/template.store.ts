import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialTemplateState } from './template.state';
import { Template } from './template.model';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export const templateStore = signalStore(
  withState(initialTemplateState),

  withMethods((store, http = inject(HttpClient)) => ({
    async loadTemplates() {
      try {
        const templates = await firstValueFrom(
          http.get<Template[]>('/invoice-templates/templates.json'),
        );

        const templateItems = templates.flatMap((t) => t.items);
        const allTags = templateItems.flatMap((item) => item.tags ?? []);
        const uniqueTags = Array.from(new Set(allTags));

        patchState(store, {
          templates: templates,
          templateItems: templateItems,
          searchTags: uniqueTags,
          isLoaded: true,
          error: null,
        });
      } catch (err: any) {
        patchState(store, {
          isLoaded: false,
          error: err?.message || 'Failed to load templates',
        });
      }
    },
  })),
);
