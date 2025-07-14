import { Component, inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, ICellRendererParams, NewValueParams } from 'ag-grid-community';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { CountryState } from '../store/state/country.state';
import { updateInvoiceSummaryRoundOff } from '../store/actions/invoice.action';
import { DEFAULT_DECIMAL_PLACES } from '../../../../util/constants';
import { numberToFixedDecimal } from '../../../../util/invoice.util';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CurrencyUtil } from '../../util/currency.util';
import { TaxOption } from '../store/model/invoice.model';


export enum InvoiceSummaryFormItem {
  ITEM_TOTAL = 'Item Total',
  DISCOUNT = 'Discount',
  SUB_TOTAL = 'Sub Total',
  TAX = 'Tax',
  ROUND_OFF = 'Round Off',
  GRAND_TOTAL = 'Grand Total',
}
@Component({
  selector: 'app-invoice-summary',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
  ],
  templateUrl: './invoice-summary.component.html',
  styleUrl: './invoice-summary.component.scss'
})
export class InvoiceSummaryComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  defaultColDef: ColDef = {
    singleClickEdit: true,
    resizable: true,
    sortable: false,
    filter: false
  };

  gridOptions: GridOptions = {
    suppressMenuHide: true,
    animateRows: true,
    headerHeight: 0,
  };

  totalInWords = '';
  grandTotalValue = '';


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams) => params.data.label;

  public store = inject<Store<CountryState>>(Store);

  public summaryGridApi!: GridApi<FormColumnDef>;

  private static findSummaryCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {
    const isGrandTotal = params.data?.label === InvoiceSummaryFormItem.GRAND_TOTAL;
    return {
      component: LabelColumnRendererComponent,
      params: {
        labelValue: params.data?.value ?? '',
        labelClass: isGrandTotal ? 'content-label-right bold-text' : 'content-label-right'
      }
    };
  };

  summaryColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150,flex:2 },
    { field: 'value', headerName: '', width: 200, flex:2,editable: (params) => {
      const label = params.data?.label ?? '';
      const editableFields = [
        InvoiceSummaryFormItem.ROUND_OFF,
      ];
      return editableFields.includes(label as InvoiceSummaryFormItem);
    } ,
    cellRendererSelector: InvoiceSummaryComponent.findSummaryCellRenderer,
    onCellValueChanged: (params: NewValueParams<FormColumnDef>) => {
      if(params.data.label !== InvoiceSummaryFormItem.ROUND_OFF) {
        return;
      }
      this.store.dispatch(updateInvoiceSummaryRoundOff({roundOff: Number(params.data.value)}));

    }}
  ];

  onSummaryGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.summaryGridApi = params.api;
    this.store.select(selectInvoice)
    .pipe(takeUntil(this.destroy$))
    .subscribe((invoice) => {
      const decimalPlaces = invoice.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
      const grandTotal = numberToFixedDecimal(invoice.grandTotal, decimalPlaces);
      const unicodeChar = String.fromCharCode(parseInt(invoice.currency.unicode, 16));
      this.grandTotalValue = `${unicodeChar} ${grandTotal}`;
      this.totalInWords = CurrencyUtil.numberToWords(invoice.grandTotal, invoice.currency.shortName, invoice.currency.fraction, decimalPlaces, invoice.internationalNumbering);
      const summaryRowData:FormColumnDef[] = [
        { label: InvoiceSummaryFormItem.ITEM_TOTAL, value: numberToFixedDecimal(invoice.itemTotal, decimalPlaces) },
      ];
      if(invoice.hasItemDiscount) {
        summaryRowData.push({ label: InvoiceSummaryFormItem.DISCOUNT, value: numberToFixedDecimal(invoice.discountTotal, decimalPlaces) },
        { label: InvoiceSummaryFormItem.SUB_TOTAL, value: numberToFixedDecimal(invoice.subTotal, decimalPlaces) },);
      }
      if(invoice.taxOption !== TaxOption.NON_TAXABLE) {
        summaryRowData.push({ label: InvoiceSummaryFormItem.TAX, value: numberToFixedDecimal(invoice.taxTotal, decimalPlaces) });
      }
      summaryRowData.push({ label: InvoiceSummaryFormItem.ROUND_OFF, value: numberToFixedDecimal(invoice.roundOff, decimalPlaces) },
        { label: InvoiceSummaryFormItem.GRAND_TOTAL, value: numberToFixedDecimal(invoice.grandTotal, decimalPlaces) },);
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
