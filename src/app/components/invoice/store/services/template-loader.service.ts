import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Template, TemplateItem } from '../template/template.model';

/** Only application-owned static catalog paths are trusted. */
@Injectable({ providedIn: 'root' })
export class TemplateLoaderService {
  private readonly http = inject(HttpClient);
  private catalog?: Promise<Template[]>;
  private readonly html = new Map<string, Promise<string>>();
  loadCatalog(): Promise<Template[]> {
    return (this.catalog ??= firstValueFrom(
      this.http.get<Template[]>('/invoice-templates/templates.json'),
    ).catch((error) => {
      this.catalog = undefined;
      throw error;
    }));
  }
  async loadTemplates(items: TemplateItem[]): Promise<{ items: TemplateItem[]; errors: string[] }> {
    const loaded: TemplateItem[] = [];
    const errors: string[] = [];
    for (let index = 0; index < items.length; index += 6) {
      const batch = await Promise.all(
        items.slice(index, index + 6).map(async (item) => {
          try {
            if (!/^\/?invoice-templates\/[\w/-]+\.html$/.test(item.path))
              throw new Error('Untrusted template path');
            let request = this.html.get(item.path);
            if (!request) {
              request = firstValueFrom(this.http.get(item.path, { responseType: 'text' })).catch(
                (error) => {
                  this.html.delete(item.path);
                  throw error;
                },
              );
              this.html.set(item.path, request);
            }
            return { ...item, html: await request };
          } catch {
            errors.push(`Could not load ${item.name}. Please retry.`);
            return null;
          }
        }),
      );
      loaded.push(
        ...batch.filter((item): item is TemplateItem & { html: string } => item !== null),
      );
    }
    return { items: loaded, errors };
  }
}
