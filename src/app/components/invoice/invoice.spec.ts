import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { testProviders } from '../../testing/test-providers';
import { Invoice } from './invoice';
import { InvoiceLogoComponent } from './invoice-logo/invoice-logo';
import { SelectTemplateComponent } from './select-template/select-template';
import { DEFAULT_INVOICE_LOGO_URL } from './store/invoice.states';

describe('Invoice', () => {
  let component: Invoice;
  let fixture: ComponentFixture<Invoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [Invoice],
    }).compileComponents();

    fixture = TestBed.createComponent(Invoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preselects the default small logo while leaving the optional large logo empty', () => {
    component.currentStep.set(1);
    fixture.detectChanges();

    const logoControls = fixture.debugElement.queryAll(By.directive(InvoiceLogoComponent));
    expect(logoControls.length).toBe(2);
    expect(component.formInvoice.controls.smallLogo.value).toBe(DEFAULT_INVOICE_LOGO_URL);
    expect(component.formInvoice.controls.largeLogo.value).toBe('');
  });

  it('configures SelectTemplateComponent with 12 items per page and 6, 12, 18, 24 options on Step 5', async () => {
    expect(component.pageSizeOptions).toEqual([6, 12, 18, 24]);
    expect(component.defaultPageSize).toBe(12);

    // Switch to step 5 (Select Template step)
    component.currentStep.set(5);
    fixture.detectChanges();
    await fixture.whenStable();

    const templateDebugEl = fixture.debugElement.query(By.directive(SelectTemplateComponent));
    expect(templateDebugEl).toBeTruthy();
    const templateComp = templateDebugEl.componentInstance as SelectTemplateComponent;
    expect(templateComp.itemsPerPage()).toBe(12);
    expect(templateComp.normalizedPageSizeOptions()).toEqual([6, 12, 18, 24]);
  });
});
