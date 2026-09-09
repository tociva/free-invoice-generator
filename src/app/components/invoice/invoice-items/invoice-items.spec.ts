import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceItemsComponent } from './invoice-items';

describe('InvoiceItemsComponent', () => {
  let component: InvoiceItemsComponent;
  let fixture: ComponentFixture<InvoiceItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceItemsComponent);
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
