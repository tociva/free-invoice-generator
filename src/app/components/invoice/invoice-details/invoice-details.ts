import { Component, input} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InvoiceForm } from '../store/models/invoice-form.model';

@Component({
  selector: 'app-invoice-details',
  imports :[ReactiveFormsModule],
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.css'],
})
export class InvoiceDetailsComponent {

advanced = input<boolean>(false);

  public InvoiceDetailsForm = input.required<FormGroup<InvoiceForm>>();
  
  formatDateForInput(date: Date | null) {
    return date ? date.toISOString().substring(0, 10) : '';
  }

}
