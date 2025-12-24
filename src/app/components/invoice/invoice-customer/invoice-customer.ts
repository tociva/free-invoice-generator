import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Customer {
  name: string;
  address: string;
  details: string;
}

@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-customer.html',
  styleUrls: ['./invoice-customer.css'],
})
export class InvoiceCustomerComponent implements OnInit {
  customer: Customer = {
    name: 'Customer Name',
    address: 'Customer Address',
    details: 'Tom towers, tom valley',
  };

  customerName: WritableSignal<string> = signal(this.customer.name);
  customerAddress: WritableSignal<string> = signal(this.customer.address);
  customerDetails: WritableSignal<string> = signal(this.customer.details);

  constructor() {}

  ngOnInit(): void {}
}
