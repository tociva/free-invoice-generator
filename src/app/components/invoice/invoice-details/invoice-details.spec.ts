import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceDetailsComponent } from './invoice-details';

describe('InvoiceDetailsComponent', () => {
  let component: InvoiceDetailsComponent;
  let fixture: ComponentFixture<InvoiceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('InvoiceDetailsForm', TestBed.inject(InvoiceFormService).form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
