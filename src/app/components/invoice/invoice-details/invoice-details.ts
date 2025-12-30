import { Component, effect, input, model, output, signal } from '@angular/core';
// import { Invoice } from '../store/model/invoice-model';
import { Field, form, required } from '@angular/forms/signals';

type InvoiceForm = {
  invoiceNo: string;
  invoiceDate: string;
  invoiceDueDate: string;
};

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [Field],
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.css'],
})
export class InvoiceDetailsComponent {
  advanced = input(false);

  invoiceModel = signal<InvoiceForm>({
    invoiceNo: '',
    invoiceDate: '',
    invoiceDueDate: '',
  });
  invoiceDetails = form(this.invoiceModel);

  valueChange = output<InvoiceForm>();
  constructor() {
    effect(() => {
      this.valueChange.emit(this.invoiceModel());
    });
  }
}
