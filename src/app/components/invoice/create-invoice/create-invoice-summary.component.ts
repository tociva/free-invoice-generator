import { inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams, NewValueParams } from "ag-grid-community";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { LabelColumnRendererComponent } from "../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component";
import { selectInvoice } from "../store/selectors/invoice.selectors";
import { CountryState } from "../store/state/country.state";
import { updateInvoiceSummaryRoundOff } from "../store/actions/invoice.action";
import { DEFAULT_DECIMAL_PLACES } from "../../../../util/constants";
import { numberToFixedDecimal } from "../../../../util/invoice.util";

export enum InvoiceSummaryFormItem {
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

  private static findSummaryCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

      return {component: LabelColumnRendererComponent,
        params: {labelValue: params.data?.value ?? '', labelClass: 'content-label-right'}};
  
  };

  summaryColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    { field: 'value', headerName: '', width: 200, editable: (params) => {
      const label = params.data?.label ?? '';
      const editableFields = [
        InvoiceSummaryFormItem.ROUND_OFF,
      ];
      return editableFields.includes(label as InvoiceSummaryFormItem);
    } ,
    cellRendererSelector: CreateInvoiceSummaryComponent.findSummaryCellRenderer,
    onCellValueChanged: (params: NewValueParams<FormColumnDef>) => {
      if(params.data.label !== InvoiceSummaryFormItem.ROUND_OFF) {
        return;
      }
      this.store.dispatch(updateInvoiceSummaryRoundOff({roundOff: Number(params.data.value)}));

    }}
  ];

  onSummaryGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.summaryGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      const decimalPlaces = invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
      const summaryRowData:FormColumnDef[] = [
        { label: InvoiceSummaryFormItem.ITEM_TOTAL, value: numberToFixedDecimal(invoice.itemTotal, decimalPlaces) },
        { label: InvoiceSummaryFormItem.DISCOUNT, value: numberToFixedDecimal(invoice.discountTotal, decimalPlaces) },
        { label: InvoiceSummaryFormItem.SUB_TOTAL, value: numberToFixedDecimal(invoice.subTotal, decimalPlaces) },
        { label: InvoiceSummaryFormItem.TAX, value: numberToFixedDecimal(invoice.taxTotal, decimalPlaces) },
        { label: InvoiceSummaryFormItem.ROUND_OFF, value: numberToFixedDecimal(invoice.roundOff, decimalPlaces) },
        { label: InvoiceSummaryFormItem.GRAND_TOTAL, value: numberToFixedDecimal(invoice.grandTotal, decimalPlaces) },
      ];
      const allRows = this.summaryGridApi.getDisplayedRowCount();
      const existingData = [];

      for (let i = 0; i < allRows; i++) {
        const rowNode = this.summaryGridApi.getDisplayedRowAtIndex(i);
        if (rowNode?.data) {
          existingData.push(rowNode.data);
        }
      }

      this.summaryGridApi.applyTransaction({
        remove: existingData,
        add: summaryRowData,
      });
    });
  }
}