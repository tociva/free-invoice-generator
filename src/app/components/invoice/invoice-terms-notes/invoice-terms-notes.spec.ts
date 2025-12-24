import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceTermsNotesComponent } from './invoice-terms-notes';

describe('InvoiceTermsNotesComponent', () => {
  let component: InvoiceTermsNotesComponent;
  let fixture: ComponentFixture<InvoiceTermsNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceTermsNotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceTermsNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
