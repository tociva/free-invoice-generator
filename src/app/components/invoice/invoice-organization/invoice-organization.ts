import { Component, effect, input, output, signal } from '@angular/core';
import { Field, form } from '@angular/forms/signals';

type Organization = {
  name: string;
  address: string;
};

@Component({
  selector: 'app-invoice-organization',
  standalone: true,
  imports: [ Field],
  templateUrl: './invoice-organization.html',
  styleUrls: ['./invoice-organization.css'],
})
export class InvoiceOrganizationComponent {
  advanced = input(false);

  organizationModel = signal<Organization>({
    name: '',
    address: '',
  });

  organizationDetails = form(this.organizationModel);

  valueChange = output<Organization>();

  constructor() {
    effect(() => {
      this.valueChange.emit(this.organizationModel());
    });
  }
}
