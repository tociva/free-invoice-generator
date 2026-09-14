import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { testProviders } from '../../../testing/test-providers';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header search button with shortcut label', () => {
    fixture.detectChanges();
    const searchBtn = fixture.nativeElement.querySelector('.app-header-search tng-button');
    expect(searchBtn).toBeTruthy();
    expect(searchBtn.textContent).toContain('Search');
    expect(searchBtn.textContent).toContain(component.shortcutLabel);
  });

  it('should open global search on Ctrl+K and prevent default', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.searchOpen()).toBe(true);
    expect(component.paletteQuery()).toBe('');
  });

  it('should open global search on Cmd+K and prevent default', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.searchOpen()).toBe(true);
    expect(component.paletteQuery()).toBe('');
  });

  it('should reset query when opened every time', () => {
    component.paletteQuery.set('previous query');
    component.searchOpen.set(false);

    component.openSearch();

    expect(component.searchOpen()).toBe(true);
    expect(component.paletteQuery()).toBe('');
  });

  it('should include Home, All Templates, invoice steps, and pages in allSearchItems', () => {
    const items = component.allSearchItems();

    const homeItem = items.find((i) => i.id === 'page-home');
    expect(homeItem).toBeTruthy();
    expect(homeItem?.route).toBe('/home');

    const templatesItem = items.find((i) => i.id === 'page-templates');
    expect(templatesItem).toBeTruthy();
    expect(templatesItem?.route).toBe('/templates');

    const invoiceStep = items.find((i) => i.id === 'invoice-step-1');
    expect(invoiceStep).toBeTruthy();
    expect(invoiceStep?.route).toBe('/invoice');
    expect(invoiceStep?.queryParams).toEqual({ step: 1 });

    const simpleStep = items.find((i) => i.id === 'simple-step-1');
    expect(simpleStep).toBeTruthy();
    expect(simpleStep?.route).toBe('/simple-invoice');
    expect(simpleStep?.queryParams).toEqual({ step: 1 });
  });

  it('should filter search items by query matching label or keywords', () => {
    component.paletteQuery.set('customer');
    const results = component.filteredResults();
    expect(results.some((r) => r.label.toLowerCase().includes('customer'))).toBe(true);

    component.paletteQuery.set('templates');
    const templateResults = component.filteredResults();
    expect(templateResults.some((r) => r.label.includes('Templates'))).toBe(true);
  });

  it('should navigate to page route when selecting a page result', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const homeItem = component.allSearchItems().find((i) => i.id === 'page-home');

    expect(homeItem).toBeTruthy();
    component.selectResult(homeItem!);

    expect(navigateSpy).toHaveBeenCalledWith(['/home'], { queryParams: undefined });
    expect(component.searchOpen()).toBe(false);
    expect(component.paletteQuery()).toBe('');
  });

  it('should navigate to step when selecting an invoice step result', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const step3Item = component.allSearchItems().find((i) => i.id === 'invoice-step-3');

    expect(step3Item).toBeTruthy();
    component.selectResult(step3Item!);

    expect(navigateSpy).toHaveBeenCalledWith(['/invoice'], { queryParams: { step: 3 } });
    expect(component.searchOpen()).toBe(false);
  });

  it('should not include individual templates in global search items', () => {
    const items = component.allSearchItems();
    expect(items.some((i) => i.id.startsWith('template-'))).toBe(false);
  });
});
