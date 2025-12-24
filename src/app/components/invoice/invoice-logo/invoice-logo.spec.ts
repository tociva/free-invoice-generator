import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceLogoComponent } from './invoice-logo';

describe('InvoiceLogoComponent', () => {
  let component: InvoiceLogoComponent;
  let fixture: ComponentFixture<InvoiceLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceLogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
