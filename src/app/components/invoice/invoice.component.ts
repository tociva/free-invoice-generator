import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { DatePickerCellEditor } from '../invoice/date-picker-cell-editor.component';

@Component({
  selector: 'app-invoice',
  standalone: true,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  imports: [
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
    FormsModule
],
})
export class InvoiceComponent {
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
    editable: true,
    cellEditorSelector: (params) => {
      const dateFields = ['Invoice Date', 'Due Date'];
      const dropdownFields = ['Currency', 'Tax Option'];

      if (dateFields.includes(params.data.label)) {
        return { component: DatePickerCellEditor };
      }

      if (dropdownFields.includes(params.data.label)) {
        return {
          component: 'agSelectCellEditor',
          params: {
            values:
              params.data.label === 'Currency'
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
    { label: 'Show Discount', value: 'true' },
  ];
} 
