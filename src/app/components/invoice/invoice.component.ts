import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { FormColumnDef } from '../../../util/form-column-def.type';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { DatePickerCellEditor } from '../invoice/date-picker-cell-editor.component';
import { CommonModule } from '@angular/common';
import { CheckboxCellRendererComponent } from './checkbox-cell-renderer.component';



@Component({
  selector: 'app-invoice',
  standalone: true,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  imports: [
    CommonModule,
    AgGridModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule
],
})
export class InvoiceComponent {
  customerForm: FormGroup;
  invoiceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.invoiceForm = this.fb.group({
      invoiceDate: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowHeight: 30,
  };

  defaultColDef = {
    sortable: false,
    resizable: false,
    suppressMenu: true,
    editable: true
  };

  customerColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    { field: 'value', headerName: '', width: 200, editable: true }
  ];

  customerRowData: FormColumnDef[] = [
    { label: 'Name', value: 'Tociva Technologies' },
    { label: 'Line 1', value: '123 Main St' },
    { label: 'Line 2', value: 'St.Louis, MO' },
    { label: 'Street', value: 'Carolina St' },
    { label: 'City', value: 'St.Louis,' },
    { label: 'Postal Code', value: '63101' },
    { label: 'State', value: 'Missouri' },
    { label: 'Country', value: 'United States' },
    { label: 'E-Mail', value: 'info@tociva.com' },
    { label: 'Mobile', value: '1234567890' }
  ];

  invoiceColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: false,
      cellRendererSelector: (params) => {
        const label = params.data?.label ?? '';
        const checkboxFields = ['Item Description', 'Show Discount'];
        return checkboxFields.includes(label)
          ? { component: CheckboxCellRendererComponent }
          : undefined;
      },
      cellEditorSelector: (params) => {
        const label = params.data?.label ?? '';
        const dateFields = ['Invoice Date', 'Due Date'];
        const dropdownFields = ['Currency', 'Tax Option'];

        if (dateFields.includes(label)) {
          return { component: DatePickerCellEditor };
        }

        if (dropdownFields.includes(label)) {
          return {
            component: 'agSelectCellEditor',
            params: {
              values:
                label === 'Currency'
                  ? ['(₹) Indian Rupee', '($) US Dollar']
                  : ['CGST/SGST', 'IGST']
            }
          };
        }

        return undefined;
      }
    }
  ];

  invoiceRowData: FormColumnDef[] = [
    { label: 'Invoice Number', value: 'INV-1001' },
    { label: 'Invoice Date', value: '2025-03-31' },
    { label: 'Due Date', value: '2025-04-07' },
    { label: 'Currency', value: '(₹) Indian Rupee' },
    { label: 'Delivery State', value: '32-Kerala' },
    { label: 'Tax Option', value: 'CGST/SGST' },
    { label: 'Item Description', value: 'true' },
    { label: 'Show Discount', value: 'true' }
  ];

  submitInvoice() {
    console.log('Invoice submitted:', {
      customer: this.customerForm.value,
      invoice: this.invoiceForm.value,
    });
  }

  templates = [
    { id: 'templateA', name: 'Classic Blue', description: 'Professional layout with blue header' },
    { id: 'templateB', name: 'Minimal Red', description: 'Clean red-bordered layout' },
    { id: 'templateC', name: 'Corporate Gray', description: 'Neutral theme with strong grid' }
  ];

  selectedTemplate: any = null;

  selectTemplate(template: any) {
    this.selectedTemplate = template;
    console.log('Selected template:', template);
  }
}
