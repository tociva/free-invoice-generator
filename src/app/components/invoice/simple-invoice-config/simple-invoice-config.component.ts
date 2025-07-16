import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridApi, GridOptions, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../util/constants';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { patchInvoiceDetails } from '../store/actions/invoice.action';
import { Currency } from '../store/model/currency.model';
import { DateFormat } from '../store/model/date-format.model';
import { selectAllCurrencies } from '../store/selectors/currency.selectors';
import { selectAllDateFormats } from '../store/selectors/date-format.selectors';
import { selectInvoice } from '../store/selectors/invoice.selectors';

export enum InvoiceDetailsFormItem {
  CURRENCY = 'Currency Editor',
  CURRENCY_LABEL = 'Currency',
  DATE_FORMAT = 'Date Format Editor',
  DATE_FORMAT_LABEL = 'Date Format',
  EMPTY_ROW = 'Empty Row',
}

@Component({
  selector: 'app-simple-invoice-config',
  imports: [CommonModule,
    AgGridModule],
  templateUrl: './simple-invoice-config.component.html',
  styleUrl: './simple-invoice-config.component.scss'
})
export class SimpleInvoiceConfigComponent implements OnInit, OnDestroy {
  private currencies: Currency[] = [];
  private dateFormats: DateFormat[] = [];
  private destroy$ = new Subject<void>();

  public detailsGridApi!: GridApi<FormColumnDef>;

  rowHeight = 35;

  defaultColDef: ColDef<FormColumnDef> = {
    singleClickEdit: true,
    editable: false,
    resizable: true,
    sortable: false,

  };

  gridOptions: GridOptions<FormColumnDef> = {
    suppressMenuHide: true,
    rowSelection: 'single',
    animateRows: true,
    enableBrowserTooltips: true,
    domLayout: 'autoHeight',
    rowHeight: 50,
  };

  constructor(public store: Store) { }

  private fetchCurrencies = (val?: string | Currency): Observable<Currency[]> => {
    // If val is of type Country, return empty array
    if (val && typeof val === 'object') {
      return of([]);
    }

    if (!val?.trim()) {
      return of(this.currencies.slice(0, OPTIONS_COUNT));
    }

    const filterVal = val.toLowerCase();
    return of(this.currencies
      .filter((currency) => currency.name.toLowerCase().startsWith(filterVal))
      .slice(0, OPTIONS_COUNT));
  };

  private fetchDateFormats = (val?: string | DateFormat): Observable<DateFormat[]> => {
    if (val && typeof val === 'object') {
      return of([]);
    }

    if (!val?.trim()) {
      return of(this.dateFormats.slice(0, OPTIONS_COUNT));
    }

    const filterVal = val.toLowerCase();
    return of(this.dateFormats
      .filter((dateFormat) => dateFormat.name.toLowerCase().startsWith(filterVal))
      .slice(0, OPTIONS_COUNT));
  };

  private handleCurrencyOptionSelected = (val: Currency): void => {
    this.store.dispatch(patchInvoiceDetails({ details: { currency: val } }));
  };

  private handleDateFormatOptionSelected = (val: DateFormat): void => {
    this.store.dispatch(patchInvoiceDetails({ details: { dateFormat: val } }));
  };

  private findCurrencyEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Currency>,
    params: {
      optionsFetcher: this.fetchCurrencies,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleCurrencyOptionSelected
    }
  });

  private findDateFormatEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<DateFormat>,
    params: {
      optionsFetcher: this.fetchDateFormats,
      displayWith: (params: DateFormat) => {
        if (!params) { return ''; }
        return params.value;
      },
      onOptionSelected: this.handleDateFormatOptionSelected
    }
  });

  private findDateEditorComponent = () => {
    const format = (this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.DATE_FORMAT)?.data?.value as DateFormat)?.value ?? 'DD-MM-YYYY';
    return format;
  };

  private findDetailsEditorComponent = (cellParams: ICellEditorParams<FormColumnDef>) => {

    switch (cellParams.data.label) {

      case InvoiceDetailsFormItem.CURRENCY:
        return this.findCurrencyEditorComponent(cellParams.data.value);

      case InvoiceDetailsFormItem.DATE_FORMAT:
        return this.findDateFormatEditorComponent(cellParams.data.value);

    }

    return {
      component: null
    };

  };

  private static findDetailsCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {


    switch (params.data?.label) {

      case InvoiceDetailsFormItem.CURRENCY:
        {
          const cur = params.data.value as Currency;
          return {
            component: LabelColumnRendererComponent,
            params: { labelValue: `(${cur.html ?? ''}) ${cur.name ?? ''}`, icon: 'arrow_drop_down_circle'}
          };
        }
      case InvoiceDetailsFormItem.DATE_FORMAT:
        {
          const dateFormat = params.data.value as DateFormat;
          return {
            component: LabelColumnRendererComponent,
            params: { labelValue: dateFormat.value, icon: 'arrow_drop_down_circle' }
          };
        }
      case InvoiceDetailsFormItem.CURRENCY_LABEL:
      case InvoiceDetailsFormItem.DATE_FORMAT_LABEL:
        {
          return {
            component: LabelColumnRendererComponent,
            params: { labelValue: params.data.value, labelClass: 'text-14-700' }
          };
        }

    }
    if (!params.data?.value) {

      return '';

    }
    return params.data.value;

  };



  ngOnInit(): void {
    this.store.select(selectAllCurrencies).pipe(takeUntil(this.destroy$)).subscribe((currencies) => {
      this.currencies = currencies;
    });
    this.store.select(selectAllDateFormats).pipe(takeUntil(this.destroy$)).subscribe((dateFormats) => {
      this.dateFormats = dateFormats;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  invoiceDetailsColumnDefs: ColDef<FormColumnDef>[] = [
    {
      field: 'value',
      headerName: '',
      width: 200,
      flex: 3,
      editable: (params) => {
        const label = params.data?.label ?? '';
        const editableFields = [
          InvoiceDetailsFormItem.CURRENCY,
          InvoiceDetailsFormItem.DATE_FORMAT,
        ];
        return editableFields.includes(label as InvoiceDetailsFormItem);
      },
      cellRendererSelector: SimpleInvoiceConfigComponent.findDetailsCellRenderer,
      cellEditorSelector: this.findDetailsEditorComponent,
    }
  ];


  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      const invoiceDetailsRowData: FormColumnDef[] = [
      ];
        invoiceDetailsRowData.push(
          { label: InvoiceDetailsFormItem.CURRENCY_LABEL, value: InvoiceDetailsFormItem.CURRENCY_LABEL },
          { label: InvoiceDetailsFormItem.CURRENCY, value: invoice.currency },
          { label: InvoiceDetailsFormItem.EMPTY_ROW, value: '' },
          { label: InvoiceDetailsFormItem.DATE_FORMAT_LABEL, value: InvoiceDetailsFormItem.DATE_FORMAT_LABEL },
          { label: InvoiceDetailsFormItem.DATE_FORMAT, value: invoice.dateFormat },
        );
      const allRows = this.detailsGridApi.getDisplayedRowCount();
      const existingData = [];

      for (let i = 0; i < allRows; i++) {
        const rowNode = this.detailsGridApi.getDisplayedRowAtIndex(i);
        if (rowNode?.data) {
          existingData.push(rowNode.data);
        }
      }

      this.detailsGridApi.applyTransaction({
        remove: existingData,
        add: invoiceDetailsRowData,
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getRowId = (params: GetRowIdParams<FormColumnDef>) => params.data.label;
}
