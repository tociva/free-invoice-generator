import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceItemsComponent } from './invoice-items';

describe('InvoiceItemsComponent', () => {
  let component: InvoiceItemsComponent;
  let fixture: ComponentFixture<InvoiceItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
