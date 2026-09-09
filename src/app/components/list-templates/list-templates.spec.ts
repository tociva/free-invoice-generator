import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../testing/test-providers';
import { ListTemplates } from './list-templates';
describe('ListTemplates', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: testProviders, imports: [ListTemplates] }),
  );
  it('creates the catalog view', () => {
    const fixture = TestBed.createComponent(ListTemplates);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
