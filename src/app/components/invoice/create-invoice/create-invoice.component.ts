import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridOptions, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { CheckboxCellRendererComponent } from '../../common/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DatePickerCellEditor } from '../../common/date-picker-cell-editor/date-picker-cell-editor.component';
import { CreateInvoiceCustomerComponent, CustomerFormItem } from './create-invoice-customer.component';
import { loadCountries } from '../store/actions/country.actions';
import { ItemCellEditorComponent } from '../../common/item-cell-editor/item-cell-editor.component';
import { ValueFormatterParams, CellClassParams } from 'ag-grid-community';


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
    singleClickEdit: true,
    enableBrowserTooltips: true,
    stopEditingWhenCellsLoseFocus: true,
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

  itemdetailsColumnDefs = [
    {
  headerName: 'Item',
  field: 'item',
  flex: 2,
  editable: true,
  cellEditor: ItemCellEditorComponent, // custom editor with placeholder
  valueFormatter: (params: ValueFormatterParams) => {
  return params.value && params.value.trim() !== ''
    ? params.value
    : 'Enter item here';
},

 cellClass: (params: CellClassParams) => {
  return !params.value || params.value.trim() === '' ? 'item-placeholder' : '';
}

},
    { headerName: 'Price', field: 'price', flex: 1, editable: true, cellClass: 'right-align' },
    { headerName: 'Quantity', field: 'quantity', flex: 1, editable: true, cellClass: 'right-align' },
    { headerName: 'Total', field: 'total', flex: 1, cellClass: 'right-align' },
    {
  headerName: '',
  field: 'delete',
  flex: 0.5,
  cellRenderer: (params: ICellRendererParams) => {
  const rowCount = params.api.getDisplayedRowCount();
  const isLastRow = rowCount === 1;

  if (isLastRow) return '';

  return `
    <button class="delete-btn" data-clear="true" aria-label="Delete">
      <span class="material-icons" style="color: red;">delete</span>
    </button>
  `;
},
  suppressMenu: true,
  suppressSorting: true
}
  ];
  itemdetailsRowData = [
    { item: '', price: '', quantity: '', total: '' }
  ];

 onCellClicked(event: any): void {
  const isDeleteBtn = event.event?.target?.closest('[data-clear]');
  if (event.colDef.field === 'delete' && isDeleteBtn) {
    const index = event.rowIndex;

    if (this.itemdetailsRowData.length > 1) {
      this.itemdetailsRowData.splice(index, 1);
      this.itemdetailsRowData = [...this.itemdetailsRowData];
    }
  }
}


onCellValueChanged(event: any): void {
  const data = event.data;
  const rowIndex = event.rowIndex;
  const price = Number(data.price);
  let quantity = Number(data.quantity);

  if (data.item?.trim() && price > 0 && (!quantity || quantity === 0)) {
    data.quantity = 1;
    quantity = 1;
  }

  data.total = price * quantity;
  const isLastRow = rowIndex === this.itemdetailsRowData.length - 1;
  if (this.isRowComplete(data) && isLastRow) {
    this.itemdetailsRowData = [
      ...this.itemdetailsRowData,
      { item: '', price: '', quantity: '', total: '' }
    ];
  }
  event.api.refreshCells({ rowNodes: [event.node], force: true });
}



onCellKeyDown(event: any): void {
  const isEnter = event.event.key === 'Enter';
  if (!isEnter) return;

  const row = event.node.data;

  const isComplete =
    row.item?.trim() &&
    Number(row.price) > 0 &&
    Number(row.quantity) > 0;

  const isLastRow = event.rowIndex === this.itemdetailsRowData.length - 1;

  if (isComplete && isLastRow) {
    this.itemdetailsRowData = [
      ...this.itemdetailsRowData,
      { item: '', price: '', quantity: '', total: '' }
    ];
  }
}
isRowComplete(row: any): boolean {
  return row.item?.trim() && Number(row.price) > 0 && Number(row.quantity) > 0;
}

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
