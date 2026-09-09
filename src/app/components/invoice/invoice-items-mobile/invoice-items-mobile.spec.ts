import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceItemsMobileComponent } from './invoice-items-mobile';

describe('InvoiceItemsMobileComponent', () => {
  let component: InvoiceItemsMobileComponent;
  let fixture: ComponentFixture<InvoiceItemsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceItemsMobileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceItemsMobileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'InvoiceItemForm',
      TestBed.inject(InvoiceFormService).form.controls.items,
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
