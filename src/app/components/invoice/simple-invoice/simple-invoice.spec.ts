import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleInvoice } from './simple-invoice';

describe('SimpleInvoice', () => {
  let component: SimpleInvoice;
  let fixture: ComponentFixture<SimpleInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleInvoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
