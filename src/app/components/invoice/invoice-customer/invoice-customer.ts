import { Component, effect, input, output, signal } from '@angular/core';
import { Field, form } from '@angular/forms/signals';

type CustomerForm = {
  name: string;
  address: string;
};

@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [Field],
  templateUrl: './invoice-customer.html',
  styleUrls: ['./invoice-customer.css'],
})
export class InvoiceCustomerComponent {
  advanced = input(false);

  customerModel = signal<CustomerForm>({
    name: '',
    address: '',
  });

  customerDetails = form(this.customerModel);

  valueChange = output<CustomerForm>();

  constructor() {
    effect(() => {
      this.valueChange.emit(this.customerModel());
    });
  }
}
