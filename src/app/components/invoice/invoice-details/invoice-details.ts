import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InvoiceDetail {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.css'],
})
export class InvoiceDetailsComponent implements OnInit {
  details: InvoiceDetail = {
    invoiceNumber: 'INV-001',
    invoiceDate: '24-06-2025',
    dueDate: '01-07-2025',
  };

  ngOnInit(): void {}
}
