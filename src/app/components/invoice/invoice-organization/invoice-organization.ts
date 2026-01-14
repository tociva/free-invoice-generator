import { Component, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrganizationForm } from '../store/models/invoice-form.model';
import { countryStore } from '../store/country/country.store';

@Component({
  selector: 'app-invoice-organization',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-organization.html',
  styleUrls: ['./invoice-organization.css'],
})
export class InvoiceOrganizationComponent {
  advanced = input<boolean>(false);
  public countryStore = inject(countryStore);
  ngOnInit(): void {
    this.countryStore.loadCountry();
  }

  public InvoiceOrganizationForm = input.required<FormGroup<OrganizationForm>>();
}
