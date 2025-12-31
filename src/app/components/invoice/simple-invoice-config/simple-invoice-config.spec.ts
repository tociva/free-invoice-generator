import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleInvoiceConfig } from './simple-invoice-config';

describe('SimpleInvoiceConfig', () => {
  let component: SimpleInvoiceConfig;
  let fixture: ComponentFixture<SimpleInvoiceConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleInvoiceConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleInvoiceConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
