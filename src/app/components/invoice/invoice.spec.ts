import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { testProviders } from '../../testing/test-providers';
import { Invoice } from './invoice';
import { SelectTemplateComponent } from './select-template/select-template';

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
