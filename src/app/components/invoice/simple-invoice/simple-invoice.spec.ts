import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { DEFAULT_INVOICE_LOGO_URL } from '../store/invoice.states';

import { SimpleInvoice } from './simple-invoice';

describe('SimpleInvoice', () => {
  let component: SimpleInvoice;
  let fixture: ComponentFixture<SimpleInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [SimpleInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preselects the default logo in the invoice form', () => {
    component.currentStep.set(1);
    fixture.detectChanges();

    expect(component.formInvoice.controls.smallLogo.value).toBe(DEFAULT_INVOICE_LOGO_URL);
  });
});
