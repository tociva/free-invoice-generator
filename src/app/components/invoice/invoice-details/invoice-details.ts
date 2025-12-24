import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface InvoiceDetail {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
}

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-details.html',
  styleUrls: ['./invoice-details.css'],
})
export class InvoiceDetailsComponent implements OnInit {
  details: InvoiceDetail = {
    invoiceNumber: 'INV-001',
    invoiceDate: '24-06-2025',
    dueDate: '01-07-2025',
  };

  invoiceNumber: WritableSignal<string> = signal(this.details.invoiceNumber);
  invoiceDate: WritableSignal<string> = signal(this.details.invoiceDate);
  dueDate: WritableSignal<string> = signal(this.details.dueDate);

  constructor() {}

  ngOnInit(): void {}
}
