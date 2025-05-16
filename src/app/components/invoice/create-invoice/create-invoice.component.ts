import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { CheckboxCellRendererComponent } from '../../common/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DatePickerCellEditor } from '../../common/date-picker-cell-editor/date-picker-cell-editor.component';
import { CreateInvoiceCustomerComponent, CustomerFormItem } from './create-invoice-customer.component';
import { loadCountries } from '../store/actions/country.actions';
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
export class CreateInvoiceComponent extends CreateInvoiceCustomerComponent {


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
      cellEditorSelector: this.findCustomerEditorComponent,
      cellRendererSelector: CreateInvoiceCustomerComponent.findCellRenderer,
    }
  ];

  customerRowData: FormColumnDef[] = [
    { label: CustomerFormItem.NAME, value: 'Tociva Technologies' },
    { label: CustomerFormItem.LINE1, value: '123 Main St' },
    { label: CustomerFormItem.LINE2, value: 'St.Louis, MO' },
    { label: CustomerFormItem.STREET, value: 'Carolina St' },
    { label: CustomerFormItem.CITY, value: 'St.Louis,' },
    { label: CustomerFormItem.ZIP, value: '63101' },
    { label: CustomerFormItem.STATE, value: 'Missouri' },
    { label: CustomerFormItem.COUNTRY, value: {name: 'United States'} },
    { label: CustomerFormItem.EMAIL, value: 'info@tociva.com' },
    { label: CustomerFormItem.MOBILE, value: '1234567890' }
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

  ngOnInit(): void {
    this.store.dispatch(loadCountries());
  }

  onCustomerGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.customerGridApi = params.api;
  }

  getRowId = (params: GetRowIdParams<FormColumnDef>) => {

    const data = params?.data;
    return data?.label ?? '';

  };
}
