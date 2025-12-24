import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewInvoiceComponent } from '../preview-invoice/preview-invoice';

@Component({
  selector: 'app-simple-invoice',
  standalone: true,
  imports: [CommonModule, PreviewInvoiceComponent],
  templateUrl: './simple-invoice.html',
  styleUrl: './simple-invoice.css',
})
export class SimpleInvoice {
  currentStep = 1;

  steps = [
    { id: 1, label: 'Fill invoice details'},
    { id: 2, label: 'Select a template'},
    { id: 3, label: 'Preview and Download'},
  ];

  goToStep(stepId: number): void {
    this.currentStep = stepId;
  }
}
