import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Organization {
  name: string;
  address: string;
  details: string;
}

@Component({
  selector: 'app-invoice-organization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-organization.html',
  styleUrls: ['./invoice-organization.css'],
})
export class InvoiceOrganizationComponent implements OnInit {
  organization: Organization = {
    name: 'My Name',
    address: 'My Address',
    details: 'String Towers, String Valley',
  };

  organizationName: WritableSignal<string> = signal(this.organization.name);
  organizationAddress: WritableSignal<string> = signal(this.organization.address);
  organizationDetails: WritableSignal<string> = signal(this.organization.details);

  constructor() {}

  ngOnInit(): void {}
}
