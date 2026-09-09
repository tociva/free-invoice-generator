import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TemplateItem } from '../template/template.model';
import { templateStore } from '../template/template.store';

describe('Template repository and store', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), templateStore],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('shares concurrent loads, requests HTML in parallel, caches it and preserves selection', async () => {
    const store = TestBed.inject(templateStore);
    const first = store.loadTemplates();
    expect(store.loadTemplates()).toBe(first);
    const items: TemplateItem[] = [1, 2].map((n) => ({
      name: `Template ${n}`,
      path: `invoice-templates/test-${n}.html`,
      tags: ['Blue'],
      color: 'Blue',
    }));
    http.expectOne('/invoice-templates/templates.json').flush([{ name: 'Blue', items }]);
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne(items[0].path).flush('<h1>[[invoice_number]]</h1>');
    http.expectOne(items[1].path).flush('<h1>[[invoice_number]]</h1>');
    await first;
    expect(store.templateItems()).toHaveLength(2);
    expect(store.searchTags()).toEqual(['Blue']);
    store.selectTemplate(items[1].path);
    await store.loadTemplates();
    http.expectNone('/invoice-templates/templates.json');
    expect(store.selectedTemplatePath()).toBe(items[1].path);
  });
  it('keeps successful templates and retries only failures', async () => {
    const store = TestBed.inject(templateStore);
    const load = store.loadTemplates();
    http.expectOne('/invoice-templates/templates.json').flush([
      {
        items: [
          { name: 'Good', path: 'invoice-templates/good.html', tags: [] },
          { name: 'Retry', path: 'invoice-templates/retry.html', tags: [] },
        ],
      },
    ]);
    await Promise.resolve();
    await Promise.resolve();
    http.expectOne('invoice-templates/good.html').flush('<p>Good</p>');
    http.expectOne('invoice-templates/retry.html').flush('', { status: 500, statusText: 'Failed' });
    await load;
    expect(store.templateItems()).toHaveLength(1);
    expect(store.error()).toContain('Retry');
    const retry = store.loadTemplates();
    await Promise.resolve();
    await Promise.resolve();
    http.expectNone('invoice-templates/good.html');
    http.expectOne('invoice-templates/retry.html').flush('<p>Recovered</p>');
    await retry;
    expect(store.templateItems()).toHaveLength(2);
    expect(store.error()).toBeNull();
  });
});
