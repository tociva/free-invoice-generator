import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceCustomerComponent } from './invoice-customer';

describe('InvoiceCustomerComponent', () => {
  let component: InvoiceCustomerComponent;
  let fixture: ComponentFixture<InvoiceCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceCustomerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceCustomerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'InvoiceCustomerForm',
      TestBed.inject(InvoiceFormService).form.controls.customer,
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
