import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-terms-notes',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-terms-notes.html',
  styleUrls: ['./invoice-terms-notes.css'],
})
export class InvoiceTermsNotesComponent {
  public InvoiceTermsNotes = input.required<FormGroup<InvoiceForm>>();
}
