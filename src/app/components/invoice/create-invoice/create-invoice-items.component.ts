import { ItemCellEditorComponent } from "../../common/item-cell-editor/item-cell-editor.component";
import { CellClassParams, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import { CreateInvoiceSummaryComponent } from "./create-invoice-summary.component";
export class CreateInvoiceItemsComponent extends CreateInvoiceSummaryComponent {
  itemdetailsColumnDefs = [
    {
      headerName: 'Item',
      field: 'item',
      flex: 2,
      editable: true,
      cellEditor: ItemCellEditorComponent,
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
}