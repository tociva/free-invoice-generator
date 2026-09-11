import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { sampleInvoice } from '../../../list-templates/template.utils';
import { TemplateUtil } from '../../utils/templates.utils';
import { TemplateLoaderService } from '../services/template-loader.service';
import { TemplateService } from '../services/template.services';
import { initialTemplateState } from './template.state';

export const templateStore = signalStore(
  { providedIn: 'root' },
  withState(initialTemplateState),
  withMethods(
    (store, loader = inject(TemplateLoaderService), rendering = inject(TemplateService)) => {
      let pending: Promise<void> | undefined;
      return {
        selectTemplate(path: string) {
          patchState(store, { selectedTemplatePath: path });
        },
        loadTemplates(): Promise<void> {
          if (pending) return pending;
          if (store.isLoaded()) return Promise.resolve();
          patchState(store, { loadingTemplateHtml: true, error: null });
          pending = (async () => {
            try {
              const templates = await loader.loadCatalog();
              const result = await loader.loadTemplates(
                templates.flatMap((template) => template.items),
              );
              const templateItems = result.items.map((item) => ({
                ...item,
                safeHTML: rendering.createWrappedSafeHtml(
                  TemplateUtil.fillTemplate(item.html ?? '', sampleInvoice),
                ),
              }));
              patchState(store, {
                templates,
                templateItems,
                searchTags: [...new Set(templateItems.flatMap((item) => item.tags ?? []))],
                isLoaded: result.errors.length === 0,
                error: result.errors.join(' ') || null,
              });
            } catch (error: unknown) {
              patchState(store, {
                error: error instanceof Error ? error.message : 'Failed to load templates',
              });
            } finally {
              patchState(store, { loadingTemplateHtml: false });
              pending = undefined;
            }
          })();
          return pending;
        },
      };
    },
  ),
);
