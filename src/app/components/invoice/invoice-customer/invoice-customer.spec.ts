import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceCustomerComponent } from './invoice-customer';

describe('InvoiceCustomerComponent', () => {
  let component: InvoiceCustomerComponent;
  let fixture: ComponentFixture<InvoiceCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceCustomerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
