import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Invoice } from './invoice';

describe('Invoice', () => {
  let component: Invoice;
  let fixture: ComponentFixture<Invoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Invoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Invoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
