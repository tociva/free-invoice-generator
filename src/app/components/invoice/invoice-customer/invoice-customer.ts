import { Component, inject, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerForm } from '../store/models/invoice-form.model';
import { countryStore } from '../store/country/country.store';

@Component({
  selector: 'app-invoice-customer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-customer.html',
  styleUrls: ['./invoice-customer.css'],
})
export class InvoiceCustomerComponent implements OnInit {
  advanced = input<boolean>(false);
  public countryStore = inject(countryStore);
  ngOnInit(): void {
    this.countryStore.loadCountry();
  }
  public InvoiceCustomerForm = input.required<FormGroup<CustomerForm>>();
}
