import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { invoiceStore } from '../store/invoice.store';
import { TemplateItem } from '../store/template/template.model';
import { SelectTemplateComponent } from './select-template';

const createMockTemplates = (count: number): TemplateItem[] =>
  Array.from({ length: count }, (_, i) => ({
    name: `Template ${i + 1}`,
    path: `template-${i + 1}`,
    tags: i % 2 === 0 ? ['TagA'] : ['TagB'],
    color: 'Blue' as const,
  }));

describe('SelectTemplateComponent', () => {
  let component: SelectTemplateComponent;
  let fixture: ComponentFixture<SelectTemplateComponent>;

  beforeEach(async () => {
    if (typeof window !== 'undefined') {
      window.scrollTo = vi.fn();
    }

    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [SelectTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses default Simple Invoice pagination (10 per page, options 5, 10, 15, 20)', () => {
    fixture.componentRef.setInput('templates', createMockTemplates(25));
    fixture.detectChanges();

    expect(component.itemsPerPage()).toBe(10);
    expect(component.normalizedPageSizeOptions()).toEqual([5, 10, 15, 20]);
    expect(component.pageSizeOptionStrings()).toEqual(['5', '10', '15', '20']);
    expect(component.displayedTemplates().length).toBe(10);

    const selectEl = fixture.nativeElement.querySelector('tng-select.app-page-size');
    expect(selectEl).toBeTruthy();
    expect(selectEl.getAttribute('ng-reflect-value') || component.itemsPerPage().toString()).toBe(
      '10',
    );
  });

  describe('Advanced Invoice configuration (6, 12, 18, 24 with default 12)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('pageSizeOptions', [6, 12, 18, 24]);
      fixture.componentRef.setInput('defaultPageSize', 12);
      fixture.componentRef.setInput('templates', createMockTemplates(25));
      fixture.detectChanges();
    });

    it('displays 12 templates per page by default and shows 12 as selected in options', () => {
      expect(component.itemsPerPage()).toBe(12);
      expect(component.normalizedPageSizeOptions()).toEqual([6, 12, 18, 24]);
      expect(component.pageSizeOptionStrings()).toEqual(['6', '12', '18', '24']);
      expect(component.displayedTemplates().length).toBe(12);
      expect(component.displayedTemplates()[0].name).toBe('Template 1');
      expect(component.displayedTemplates()[11].name).toBe('Template 12');

      // Verify open dropdown state
      const selectEl = fixture.nativeElement.querySelector('tng-select.app-page-size');
      const triggerBtn = selectEl.querySelector('button');
      triggerBtn?.click();
      fixture.detectChanges();

      const options = Array.from(document.querySelectorAll('[data-slot="select-option"]'));
      if (options.length > 0) {
        const option6 = options.find((el) => el.textContent?.includes('6'));
        const option12 = options.find((el) => el.textContent?.includes('12'));

        expect(option12?.hasAttribute('data-selected')).toBe(true);
        expect(option6?.hasAttribute('data-selected')).toBe(false);
      }
    });

    it('calculates total pages, start index, and end index using 12', () => {
      // 25 templates / 12 per page = 3 pages
      expect(component.totalItems()).toBe(25);
      expect(component.pages()).toBe(3);
      expect(component.startIndex()).toBe(1);
      expect(component.endIndex()).toBe(12);
      expect(component.pageNumbers()).toEqual([1, 2, 3]);
    });

    it('updates displayed templates count when page size is changed to 6, 18, or 24', () => {
      // Change to 6
      component.changePageSize('6');
      fixture.detectChanges();
      expect(component.itemsPerPage()).toBe(6);
      expect(component.displayedTemplates().length).toBe(6);
      expect(component.pages()).toBe(5);
      expect(component.endIndex()).toBe(6);

      // Change to 18
      component.changePageSize('18');
      fixture.detectChanges();
      expect(component.itemsPerPage()).toBe(18);
      expect(component.displayedTemplates().length).toBe(18);
      expect(component.pages()).toBe(2);
      expect(component.endIndex()).toBe(18);

      // Change to 24
      component.changePageSize('24');
      fixture.detectChanges();
      expect(component.itemsPerPage()).toBe(24);
      expect(component.displayedTemplates().length).toBe(24);
      expect(component.pages()).toBe(2);
      expect(component.endIndex()).toBe(24);
    });

    it('resets to page 1 when changing page size', () => {
      component.changePageSize('6');
      component.goToPage(3);
      expect(component.currentPage()).toBe(3);

      component.changePageSize('12');
      expect(component.currentPage()).toBe(1);
      expect(component.startIndex()).toBe(1);
      expect(component.endIndex()).toBe(12);
    });

    it('resets to page 1 when searching or filtering templates', () => {
      component.goToPage(2);
      expect(component.currentPage()).toBe(2);

      component.selectTag('TagA');
      expect(component.currentPage()).toBe(1);

      component.goToPage(2);
      expect(component.currentPage()).toBe(2);

      component.clearSearch();
      expect(component.currentPage()).toBe(1);
    });

    it('does not allow stale pagination state such as page 5 remaining selected when page size changes or list shrinks', () => {
      // Switch to page size 6 (30 templates = 5 pages)
      fixture.componentRef.setInput('templates', createMockTemplates(30));
      component.changePageSize('6');
      fixture.detectChanges();

      component.goToPage(5);
      expect(component.currentPage()).toBe(5);
      expect(component.displayedTemplates().length).toBe(6);

      // Switch to page size 12: should reset to page 1
      component.changePageSize('12');
      fixture.detectChanges();
      expect(component.currentPage()).toBe(1);
      expect(component.safeCurrentPage()).toBe(1);
      expect(component.displayedTemplates().length).toBe(12);
    });

    it('preserves template ordering and navigates pages correctly', () => {
      expect(component.currentPage()).toBe(1);
      expect(component.displayedTemplates()[0].name).toBe('Template 1');

      component.nextPage();
      expect(component.currentPage()).toBe(2);
      expect(component.displayedTemplates()[0].name).toBe('Template 13');
      expect(component.startIndex()).toBe(13);
      expect(component.endIndex()).toBe(24);

      component.nextPage();
      expect(component.currentPage()).toBe(3);
      expect(component.displayedTemplates().length).toBe(1);
      expect(component.displayedTemplates()[0].name).toBe('Template 25');
      expect(component.startIndex()).toBe(25);
      expect(component.endIndex()).toBe(25);

      component.prevPage();
      expect(component.currentPage()).toBe(2);
      expect(component.displayedTemplates()[0].name).toBe('Template 13');
    });
  });

  describe('Live invoice data preview', () => {
    it('renders template previews using current invoice data rather than sample data', () => {
      const store = TestBed.inject(invoiceStore);
      store.setInvoice({
        invoiceNo: 'LIVE-INV-777',
        customer: {
          name: 'Custom Live Client Corp',
          address: '123 Live Street',
          country: {
            name: 'India',
            code: '91',
            iso: 'IN',
            phone: '91',
            currencycode: 'INR',
            dateformat: 'DD-MM-YYYY',
            currency: {
              code: 'INR',
              name: 'Indian Rupee',
              symbol: '₹',
              numericcode: 356,
              minorunit: 2,
              fraction: 'Paisa',
            },
            dateFormat: {
              name: '24-06-2025',
              value: 'DD-MM-YYYY',
            },
          },
          email: 'client@live.com',
          phone: '9876543210',
          gstin: 'GSTIN12345',
        },
      });

      const mockTemplatesWithHtml: TemplateItem[] = [
        {
          name: 'Classic Template',
          path: 'classic',
          tags: ['Business'],
          color: 'Blue',
          html: '<div><span class="inv-num">[[invoice_number]]</span><span class="cust-name">[[customer_name]]</span></div>',
        },
      ];

      fixture.componentRef.setInput('templates', mockTemplatesWithHtml);
      fixture.detectChanges();

      const displayed = component.displayedTemplates();
      expect(displayed.length).toBe(1);
      expect(displayed[0].safeHTML).toBeTruthy();

      // Convert SafeHtml to string for checking
      const htmlStr = String((displayed[0].safeHTML as unknown as { changingThisBreaksApplicationSecurity?: string })?.changingThisBreaksApplicationSecurity ?? displayed[0].safeHTML);
      expect(htmlStr).toContain('LIVE-INV-777');
      expect(htmlStr).toContain('Custom Live Client Corp');
    });

    it('updates displayed template previews when invoiceStore changes', () => {
      const store = TestBed.inject(invoiceStore);
      store.setInvoice({ invoiceNo: 'FIRST-001' });

      const mockTemplates: TemplateItem[] = [
        {
          name: 'Test Template',
          path: 'test-1',
          tags: ['Tech'],
          color: 'Blue',
          html: '<p>Invoice ID: [[invoice_number]]</p>',
        },
      ];

      fixture.componentRef.setInput('templates', mockTemplates);
      fixture.detectChanges();

      let displayed = component.displayedTemplates();
      let htmlStr = String((displayed[0].safeHTML as unknown as { changingThisBreaksApplicationSecurity?: string })?.changingThisBreaksApplicationSecurity ?? displayed[0].safeHTML);
      expect(htmlStr).toContain('FIRST-001');

      // Update invoice in store
      store.setInvoice({ invoiceNo: 'UPDATED-002' });
      fixture.detectChanges();

      displayed = component.displayedTemplates();
      htmlStr = String((displayed[0].safeHTML as unknown as { changingThisBreaksApplicationSecurity?: string })?.changingThisBreaksApplicationSecurity ?? displayed[0].safeHTML);
      expect(htmlStr).toContain('UPDATED-002');
    });

    it('highlights selected template card by path and renders iframe with scrolling="no"', () => {
      const mockTemplates: TemplateItem[] = [
        {
          name: 'Template One',
          path: 'tpl-1',
          tags: ['Tag'],
          color: 'Blue',
          html: '<div>Tpl 1</div>',
        },
        {
          name: 'Template Two',
          path: 'tpl-2',
          tags: ['Tag'],
          color: 'Blue',
          html: '<div>Tpl 2</div>',
        },
      ];

      fixture.componentRef.setInput('templates', mockTemplates);
      fixture.componentRef.setInput('selectedTemplate', mockTemplates[1]);
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('.app-template-card');
      expect(cards.length).toBe(2);
      expect(cards[0].classList.contains('app-template-card--selected')).toBe(false);
      expect(cards[1].classList.contains('app-template-card--selected')).toBe(true);

      const iframes = fixture.nativeElement.querySelectorAll('.app-template-frame');
      expect(iframes.length).toBe(2);
      expect(iframes[0].getAttribute('scrolling')).toBe('no');
      expect(iframes[0].getAttribute('tabindex')).toBe('-1');
    });
  });
});
