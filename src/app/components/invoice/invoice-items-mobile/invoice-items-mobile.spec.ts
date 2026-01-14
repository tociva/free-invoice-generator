import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceItemsMobileComponent } from './invoice-items-mobile';

describe('InvoiceItemsMobileComponent', () => {
  let component: InvoiceItemsMobileComponent;
  let fixture: ComponentFixture<InvoiceItemsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceItemsMobileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceItemsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
