import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('updates the document title and description tags', () => {
    service.setTags({
      title: 'Free Invoice Generator - Daybook.Cloud',
      description: 'Create professional invoices instantly.',
    });

    expect(title.getTitle()).toBe('Free Invoice Generator - Daybook.Cloud');
    expect(meta.getTag('name="description"')?.content).toBe(
      'Create professional invoices instantly.',
    );
    expect(meta.getTag('property="og:title"')?.content).toBe(
      'Free Invoice Generator - Daybook.Cloud',
    );
    expect(meta.getTag('property="og:description"')?.content).toBe(
      'Create professional invoices instantly.',
    );
  });

  it('uses the resolved route title for Open Graph tags', () => {
    service.applyFromRoute({
      title: 'Invoice Generator Help & Documentation - Daybook.Cloud',
      data: {
        description: 'Guides for creating invoices.',
      },
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot);

    expect(title.getTitle()).toBe('Invoice Generator Help & Documentation - Daybook.Cloud');
    expect(meta.getTag('property="og:title"')?.content).toBe(
      'Invoice Generator Help & Documentation - Daybook.Cloud',
    );
    expect(meta.getTag('name="description"')?.content).toBe('Guides for creating invoices.');
  });
});
