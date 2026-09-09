import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testProviders } from '../../../testing/test-providers';
import { InvoiceFormService } from '../store/models/invoice-form';
import { InvoiceTermsNotesComponent } from './invoice-terms-notes';

describe('InvoiceTermsNotesComponent', () => {
  let component: InvoiceTermsNotesComponent;
  let fixture: ComponentFixture<InvoiceTermsNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: testProviders,
      imports: [InvoiceTermsNotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceTermsNotesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('InvoiceTermsNotes', TestBed.inject(InvoiceFormService).form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
