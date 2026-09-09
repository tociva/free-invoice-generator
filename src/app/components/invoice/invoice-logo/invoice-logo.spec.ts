import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceLogoComponent } from './invoice-logo';

describe('InvoiceLogoComponent', () => {
  let component: InvoiceLogoComponent;
  let fixture: ComponentFixture<InvoiceLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceLogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceLogoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('InvoiceLogo', TestBed.inject(InvoiceFormService).form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
