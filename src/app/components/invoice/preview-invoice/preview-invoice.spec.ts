import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreviewInvoiceComponent } from './preview-invoice';

describe('PreviewInvoiceComponent', () => {
  let component: PreviewInvoiceComponent;
  let fixture: ComponentFixture<PreviewInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewInvoiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
