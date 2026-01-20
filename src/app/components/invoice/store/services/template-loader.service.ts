import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TemplateService } from './template.services';
import { templateStore } from '../template/template.store';
import { TemplateItem } from '../template/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateLoaderService {
  private _http = inject(HttpClient);
  private templateService = inject(TemplateService);
  private templateStore = inject(templateStore);

  async loadTemplates(): Promise<TemplateItem[]> {
    if (!this.templateStore.isLoaded()) {
      await this.templateStore.loadTemplates();
    }

    const items = this.templateStore.templateItems();
    const loadedTemplates: TemplateItem[] = [];

    for (const item of items) {
      try {
        const html = await firstValueFrom(this._http.get(item.path, { responseType: 'text' }));
        const safeHTML = this.templateService.createWrappedSafeHtml(html);
        loadedTemplates.push({ ...item, html, template: html, safeHTML });
      } catch (err) {
        console.error(`Failed to load template ${item.path}`, err);
      }
    }

    return loadedTemplates;
  }
}
