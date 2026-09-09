import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TngInputFieldComponent } from '@tailng-ui/components';
import { TngInput } from '@tailng-ui/primitives';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-terms-notes',
  standalone: true,
  imports: [TngInputFieldComponent, TngInput, ReactiveFormsModule],
  templateUrl: './invoice-terms-notes.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./invoice-terms-notes.css'],
})
export class InvoiceTermsNotesComponent {
  public InvoiceTermsNotes = input.required<FormGroup<InvoiceForm>>();
}
