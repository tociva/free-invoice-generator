import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';

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
});
