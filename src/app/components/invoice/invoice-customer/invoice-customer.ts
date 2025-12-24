import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Customer {
  name: string;
  address: string;
  details: string;
}

@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-customer.html',
  styleUrls: ['./invoice-customer.css'],
})
export class InvoiceCustomerComponent implements OnInit {
  customer: Customer = {
    name: 'Customer Name',
    address: 'Customer Address',
    details: 'Tom towers, tom valley',
  };

  ngOnInit(): void {}
}
