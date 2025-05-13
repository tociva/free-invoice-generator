import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invoice',
  standalone: true,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class InvoiceComponent {
  clientName = '';
  invoiceDate = '';
  amount = 0;

  constructor(private location: Location) {}

  generateInvoice() {
    console.log('Invoice generated:', {
      clientName: this.clientName,
      invoiceDate: this.invoiceDate,
      amount: this.amount
    });
  }

  goBack() {
    this.location.back();
  }
}
