import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { ColDef, GridOptions } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { DatePickerCellEditor } from '../../common/date-picker-cell-editor/date-picker-cell-editor.component';
import { CheckboxCellRendererComponent } from '../../common/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { CountryAutocompleteEditorComponent } from '../../common/country-autocomplete-editor/country-autocomplete-editor.component';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    AgGridModule,
    MatCardModule,

  ],
  templateUrl: './create-invoice.component.html',
  styleUrl: './create-invoice.component.scss'
})
export class CreateInvoiceComponent {

  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowHeight: 30,
    singleClickEdit: true
  };

  defaultColDef = {
    sortable: false,
    resizable: false,
    suppressMenu: true,
    editable: false
  };

  customerColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: true,
      cellEditorSelector: (params) => {
        return params.data?.label === 'Country'
          ? { component: CountryAutocompleteEditorComponent }
          : undefined;
      }
    }
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
      editable: (params) => {
        const label = params.data?.label ?? '';
        const editableFields = ['Invoice Number', 'Invoice Date', 'Due Date', 'Currency', 'Delivery State', 'Tax Option'];
        return editableFields.includes(label);
      },
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

        if (dateFields.includes(label)) {
          return { component: DatePickerCellEditor };
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
}
