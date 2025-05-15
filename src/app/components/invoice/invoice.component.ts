import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { SelectTemplateComponent } from './select-template/select-template.component';
import { PreviewInvoiceComponent } from './preview-invoice/preview-invoice.component';

@Component({
  selector: 'app-invoice',
  imports: [CommonModule, MatStepperModule, MatButtonModule, CreateInvoiceComponent, SelectTemplateComponent, PreviewInvoiceComponent],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  standalone: true
})
export class InvoiceComponent {

}
