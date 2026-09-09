import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../testing/test-providers';
import { InvoicePreviewDialogComponent } from './invoice-preview-dialog';

describe('InvoicePreviewDialogComponent', () => {
  let component: InvoicePreviewDialogComponent;
  let fixture: ComponentFixture<InvoicePreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoicePreviewDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicePreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
