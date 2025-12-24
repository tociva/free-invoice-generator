import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceDetailsComponent } from './invoice-details';

describe('InvoiceDetailsComponent', () => {
  let component: InvoiceDetailsComponent;
  let fixture: ComponentFixture<InvoiceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
