import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { CountryState } from "../store/state/country.state";
import { Store } from "@ngrx/store";
import { inject } from "@angular/core";
import { selectInvoice } from "../store/selectors/invoice.selectors";

export enum InvoiceItemsFormItem {
  ITEM_TOTAL = 'Item Total',
  DISCOUNT = 'Discount',
  SUB_TOTAL = 'Sub Total',
  TAX = 'Tax',
  ROUND_OFF = 'Round Off',
  GRAND_TOTAL = 'Grand Total',
}

export class CreateInvoiceSummaryComponent {


  public store = inject<Store<CountryState>>(Store);

  public summaryGridApi!: GridApi<FormColumnDef>;

  public summaryRowData: FormColumnDef[] = [];

  summaryColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    { field: 'value', headerName: '', width: 200, editable: true ,}
  ];

  onSummaryGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.summaryGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.summaryRowData = [
        { label: InvoiceItemsFormItem.ITEM_TOTAL, value: invoice.itemTotal },
        { label: InvoiceItemsFormItem.DISCOUNT, value: invoice.discountTotal },
        { label: InvoiceItemsFormItem.SUB_TOTAL, value: invoice.subTotal },
        { label: InvoiceItemsFormItem.TAX, value: invoice.taxTotal },
        { label: InvoiceItemsFormItem.ROUND_OFF, value: invoice.roundOff },
        { label: InvoiceItemsFormItem.GRAND_TOTAL, value: invoice.grandTotal },
      ];
    });
  }
}