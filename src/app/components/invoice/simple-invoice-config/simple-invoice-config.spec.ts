import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';

import { SimpleInvoiceConfig } from './simple-invoice-config';

describe('SimpleInvoiceConfig', () => {
  let component: SimpleInvoiceConfig;
  let fixture: ComponentFixture<SimpleInvoiceConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [SimpleInvoiceConfig],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleInvoiceConfig);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('InvoiceConfiq', TestBed.inject(InvoiceFormService).form);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
