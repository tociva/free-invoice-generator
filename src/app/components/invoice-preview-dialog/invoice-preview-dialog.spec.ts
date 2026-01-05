import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { InvoicePreviewDialogComponent } from './invoice-preview-dialog';

describe('InvoicePreviewDialogComponent', () => {
  let component: InvoicePreviewDialogComponent;
  let fixture: ComponentFixture<InvoicePreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicePreviewDialogComponent],
      providers: [DomSanitizer],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicePreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

