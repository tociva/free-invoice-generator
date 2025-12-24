import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Organization {
  name: string;
  address: string;
  details: string;
}

@Component({
  selector: 'app-invoice-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-organization.html',
  styleUrls: ['./invoice-organization.css'],
})
export class InvoiceOrganizationComponent implements OnInit {
  organization: Organization = {
    name: 'My Name',
    address: 'My Address',
    details: 'String Towers, String Valley',
  };

  ngOnInit(): void {}
}
