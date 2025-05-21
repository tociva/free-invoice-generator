import { Component, Input } from '@angular/core';
import { ItemCellEditorComponent } from "../../common/item-cell-editor/item-cell-editor.component";
import { CellClassParams, ColDef, ColGroupDef, GridApi, GridReadyEvent, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import { CreateInvoiceSummaryComponent } from "./create-invoice-summary.component";
import { FormColumnDef } from "../../../../util/form-column-def.type";


@Component({
  selector: 'app-create-invoice-items',
  standalone: true,
  template: '',
})

export class CreateInvoiceItemsComponent extends CreateInvoiceSummaryComponent {
  columnApi!: { setColumnDefs: (defs: any) => void };
  itemDescriptionEnabled = false;
  discountEnabled = false;


  @Input()
  invoiceRowData: FormColumnDef[] = [];

  ngOnChanges(): void {
    this.updateTaxOption();
  }

  currentTaxOption: string = '';
  get itemdetailsColumnDefs(): (ColDef | ColGroupDef)[] {
    const baseCols: (ColDef | ColGroupDef)[] = [
      {
        headerName: 'Item Details',
        children: [
          {
            headerName: 'Item',
            field: 'item',
            flex: 2,
            editable: true,
            cellEditor: ItemCellEditorComponent,
            valueFormatter: (params: ValueFormatterParams) =>
              params.value?.trim() || 'Enter item here',
            cellClass: (params: CellClassParams) =>
              !params.value?.trim() ? 'item-placeholder' : ''
          },
          ...(this.itemDescriptionEnabled ? [
            {
              headerName: 'Description',
              field: 'discription',
              flex: 1,
              editable: true,
              cellClass: 'right-align'
            }
          ] : []),
          { headerName: 'Price', field: 'price', flex: 1, editable: true, cellClass: 'right-align' },
          { headerName: 'Quantity', field: 'quantity', flex: 1, editable: true, cellClass: 'right-align' },
          { headerName: 'Item Total', field: 'total', flex: 1, cellClass: 'right-align' }
        ]
      }
    ];

    if (this.discountEnabled) {
      baseCols.push({
        headerName: 'Discount',
        children: [
          { headerName: '%', field: 'discount', flex: 1, editable: true, cellClass: 'right-align' },
          { headerName: 'Value', field: 'value', flex: 1, cellClass: 'right-align' },
          { headerName: 'Sub Total', field: 'sub_total', flex: 1, cellClass: 'right-align' }
        ]
      });
    }
    const taxOption = this.currentTaxOption || this.getTaxOption();
    if (taxOption === 'CGST/SGST') {
      baseCols.push({
        headerName: 'Tax',
        children: [
          { headerName: 'CGST', field: 'cgst', flex: 1, editable: true, cellClass: 'right-align' },
          { headerName: 'SGST', field: 'sgst', flex: 1, editable: true, cellClass: 'right-align' },
          { headerName: 'Grand Total', field: 'grand_total', flex: 1, cellClass: 'right-align' }
        ]
      });
    } else if (taxOption === 'IGST') {
      baseCols.push({
        headerName: 'Tax',
        children: [
          { headerName: 'IGST', field: 'igst', flex: 1, editable: true, cellClass: 'right-align' },
          { headerName: 'Grand Total', field: 'grand_total', flex: 1, editable: true, cellClass: 'right-align' }
        ]
      });
    }
    baseCols.push({
      headerName: '',
      field: 'delete',
      flex: 0.5,
      cellRenderer: (params: ICellRendererParams) => {
        const rowCount = params.api.getDisplayedRowCount();
        return rowCount === 1
          ? ''
          : `<button class="delete-btn" data-clear="true" aria-label="Delete">
          <span class="material-icons" style="color: red;">delete</span></button>`;
      }
    });
    return baseCols;
  }

  itemdetailsRowData: {
    item: string;
    price: number | null;
    quantity: number | null;
    total: number | null;
    discount: number | null;
    value: number | null;
    sub_total: number | null;
    cgst: number | null;
    sgst: number | null;
    igst: number | null;
    grand_total: number | null;
  }[] = [
      {
        item: '',
        price: null,
        quantity: null,
        total: null,
        discount: null,
        value: null,
        sub_total: null,
        cgst: null,
        sgst: null,
        igst: null,
        grand_total: null
      }
    ];
  getTaxOption(): string {
    const taxOption = this.invoiceRowData.find(r => r.label === 'Tax Option');
    return typeof taxOption?.value === 'string' ? taxOption.value : '';
  }
  onInvoiceDetailsCellValueChanged(event: any): void {
    if (event.data.label === 'Tax Option') {
      this.updateTaxOption();
    }
  }
  updateTaxOption(): void {
    const taxOption = this.getTaxOption();
    if (taxOption !== this.currentTaxOption) {
      this.currentTaxOption = taxOption;
      this.columnApi?.setColumnDefs(this.itemdetailsColumnDefs);
    }
  }
}