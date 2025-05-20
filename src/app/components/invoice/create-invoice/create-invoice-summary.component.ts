import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { FormColumnDef } from "../../../../util/form-column-def.type";

export enum InvoiceItemsFormItem {
  ITEM_TOTAL = 'Item Total',
  DISCOUNT = 'Discount',
  SUB_TOTAL = 'Sub Total',
  TAX = 'Tax',
  ROUND_OFF = 'Rount Off',
  GRAND_TOTAL = 'Grand Total',
}

export class CreateInvoiceSummaryComponent {

  public summaryGridApi!: GridApi<FormColumnDef>;

  summaryColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    { field: 'value', headerName: '', width: 200, editable: true }
  ];

  summaryRowData: FormColumnDef[] = [
    { label: InvoiceItemsFormItem.ITEM_TOTAL, value: '' },
    { label: InvoiceItemsFormItem.DISCOUNT, value: '' },
    { label: InvoiceItemsFormItem.SUB_TOTAL, value: '' },
    { label: InvoiceItemsFormItem.TAX, value: '' },
    { label: InvoiceItemsFormItem.ROUND_OFF, value: '' },
    { label: InvoiceItemsFormItem.GRAND_TOTAL, value: '' }
  ];

  onSummaryGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.summaryGridApi = params.api;
  }
}