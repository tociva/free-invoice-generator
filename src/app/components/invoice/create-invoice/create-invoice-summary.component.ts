import { inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams, NewValueParams } from "ag-grid-community";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { LabelColumnRendererComponent } from "../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component";
import { selectInvoice } from "../store/selectors/invoice.selectors";
import { CountryState } from "../store/state/country.state";
import { updateInvoiceSummaryRoundOff } from "../store/actions/invoice.action";

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

  public summaryRowData: FormColumnDef[] = [];

  private static findSummaryCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

    const numVal = Number(params.data?.value);
    const value = numVal === 0 ? '' : numVal;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: value}};
  
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
      this.summaryRowData = [
        { label: InvoiceSummaryFormItem.ITEM_TOTAL, value: invoice.itemTotal },
        { label: InvoiceSummaryFormItem.DISCOUNT, value: invoice.discountTotal },
        { label: InvoiceSummaryFormItem.SUB_TOTAL, value: invoice.subTotal },
        { label: InvoiceSummaryFormItem.TAX, value: invoice.taxTotal },
        { label: InvoiceSummaryFormItem.ROUND_OFF, value: invoice.roundOff },
        { label: InvoiceSummaryFormItem.GRAND_TOTAL, value: invoice.grandTotal },
      ];
    });
  }
}