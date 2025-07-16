import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GetRowIdParams, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams, NewValueParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../util/constants';
import { displayAutoCompleteWithName, isMobile } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { DatePickerEditorComponent } from '../../common/ag-grid/editor/date-picker-editor/date-picker-editor.component';
import { CheckboxColumnRendererComponent } from '../../common/ag-grid/renderer/checkbox-column-renderer/checkbox-column-renderer.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { patchInvoiceDetails, setInvoiceShowDiscount, setInvoiceTaxOption } from '../store/actions/invoice.action';
import { Currency } from '../store/model/currency.model';
import { DateFormat } from '../store/model/date-format.model';
import { TaxOption } from '../store/model/invoice.model';
import { selectAllCurrencies } from '../store/selectors/currency.selectors';
import { selectAllDateFormats } from '../store/selectors/date-format.selectors';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { selectAllTaxes } from '../store/selectors/tax.selectors';

export enum InvoiceDetailsFormItem {
  INVOICE_NUMBER = 'Invoice Number',
  INVOICE_DATE = 'Invoice Date',
  DUE_DATE = 'Due Date',
  CURRENCY = 'Currency',
  DELIVERY_STATE = 'Delivery State',
  TAX_OPTION = 'Tax Option',
  ITEM_DESCRIPTION = 'Item Description',
  SHOW_DISCOUNT = 'Show Discount',
  DECIMAL_PLACES = 'Decimal Places',
  DATE_FORMAT = 'Date Format',
  ACCOUNT_NUMBER = 'Account Number',
  ACCOUNT_NAME = 'Account Name',
  BANK_NAME = 'Bank Name',
}
@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent implements OnDestroy, OnInit {

  @Input() simple = false;

  private currencies: Currency[] = [];
  private dateFormats: DateFormat[] = [];
  private taxes: string[] = [];
  private destroy$ = new Subject<void>();

  public detailsGridApi!: GridApi<FormColumnDef>;

  rowHeight = 35;

  defaultColDef: ColDef<FormColumnDef> = {
    singleClickEdit: true,
    editable: false,
    resizable: true,
    sortable: false,

  };

  // gridOptions: GridOptions<FormColumnDef> = {
  //   suppressMenuHide: true,
  //   rowSelection: 'single',
  //   animateRows: true,
  //   enableBrowserTooltips: true,
  //   domLayout: 'autoHeight',
  //   getRowHeight: (params) => {
  //     switch (params.data?.label) {
  //       case InvoiceDetailsFormItem.TERMS_AND_CONDITIONS:
  //         return 70;
  //       default:
  //         return 50;
  //     }
  //   },
  // };

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

  private fetchTaxOptions = (val?: string): Observable<string[]> => {
    if (!val?.trim()) {
      return of(this.taxes);
    }
    const filterVal = val.toLowerCase();
    return of(this.taxes.filter((option) => option.toLowerCase().indexOf(filterVal) !== -1));
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


  private handleTaxOptionChange = (option: TaxOption): void => {
    this.store.dispatch(setInvoiceTaxOption({ option }));
  };

  private findDateEditorComponent = () => {
    const format = (this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.DATE_FORMAT)?.data?.value as DateFormat)?.value ?? 'DD-MM-YYYY';
    return format;
  };

  private findDetailsEditorComponent = (cellParams: ICellEditorParams<FormColumnDef>) => {

    switch (cellParams.data.label) {

      case InvoiceDetailsFormItem.INVOICE_DATE:
      case InvoiceDetailsFormItem.DUE_DATE:
        {
          const format = this.findDateEditorComponent();
          return {
            component: DatePickerEditorComponent,
            params: {
              format,
              value: cellParams.data.value,
            }
          };
        };

      case InvoiceDetailsFormItem.CURRENCY:
        return this.findCurrencyEditorComponent(cellParams.data.value);

      case InvoiceDetailsFormItem.DATE_FORMAT:
        return this.findDateFormatEditorComponent(cellParams.data.value);

      case InvoiceDetailsFormItem.TAX_OPTION:
        return {
          component: AutoCompleteEditorComponent<TaxOption>,
          params: {
            optionsFetcher: this.fetchTaxOptions,
            displayWith: (params: TaxOption) => params,
            onOptionSelected: (val: TaxOption) => this.handleTaxOptionChange(val)
          }
        };

      // case InvoiceDetailsFormItem.TERMS_AND_CONDITIONS:
      //   return { component: TextAreaEditorComponent, params: { value: cellParams.data.value, rows: 5 } };
    }

    return {
      component: null
    };

  };

  private handleItemDescriptionToggle = (val: boolean) => {
    this.store.dispatch(patchInvoiceDetails({ details: { hasItemDescription: val } }));
  };

  private handleShowDiscountToggle = (val: boolean) => {
    this.store.dispatch(setInvoiceShowDiscount({ showDiscount: val }));
  };

  private findDetailsCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {


    switch (params.data?.label) {

      case InvoiceDetailsFormItem.CURRENCY:
        {
          const cur = params.data.value as Currency;
          return {
            component: LabelColumnRendererComponent,
            params: {
              labelValue: `(${cur.html ?? ''}) ${cur.name ?? ''}`,
              icon: 'arrow_drop_down_circle',
              labelClass: 'text-grey-14-500',

            }
          };
        }
      case InvoiceDetailsFormItem.DATE_FORMAT:
        {
          const dateFormat = params.data.value as DateFormat;
          return {
            component: LabelColumnRendererComponent,
            params: { labelValue: dateFormat.value, icon: 'arrow_drop_down_circle', labelClass: 'text-grey-14-500', }
          };
        }
      case InvoiceDetailsFormItem.TAX_OPTION:
        {
          return {
            component: LabelColumnRendererComponent,
            params: { labelValue: params.data.value, icon: 'arrow_drop_down_circle', labelClass: 'text-grey-14-500', }
          };
        }
      case InvoiceDetailsFormItem.ITEM_DESCRIPTION:
        return { component: CheckboxColumnRendererComponent, params: { selected: params.data.value, onToggle: this.handleItemDescriptionToggle } };

      case InvoiceDetailsFormItem.SHOW_DISCOUNT:
        return { component: CheckboxColumnRendererComponent, params: { selected: params.data.value, onToggle: this.handleShowDiscountToggle } };

      case InvoiceDetailsFormItem.INVOICE_DATE:
      case InvoiceDetailsFormItem.DUE_DATE: {
        const dateFormatText = this.findDateEditorComponent();
        const date = params.data?.value as Date;
        const dateText = dayjs(date).format(dateFormatText);
        return {
          component: LabelColumnRendererComponent,
          params: {
            labelValue: dateText,
            labelClass: 'text-grey-14-500',
          }
        };
      }

      case InvoiceDetailsFormItem.ACCOUNT_NUMBER:
      case InvoiceDetailsFormItem.ACCOUNT_NAME:
      case InvoiceDetailsFormItem.BANK_NAME:
        return {
          component: LabelColumnRendererComponent,
          params: {
            labelValue: params.data.value,
            labelClass: 'text-grey-14-500',
            multiLine: true,
          }
        };
    }

    const val = params.data?.value ?? '';
    return {
      component: LabelColumnRendererComponent,
      params: {
        labelValue: val,
        labelClass: 'text-grey-14-500',
      }
    };
  };

  private handleInvoiceDetailsCellValueChanged = (event: NewValueParams<FormColumnDef>) => {
    switch (event.data.label) {
      case InvoiceDetailsFormItem.INVOICE_NUMBER:
        {
          this.store.dispatch(patchInvoiceDetails({ details: { number: event.newValue } }));
          break;
        }
      case InvoiceDetailsFormItem.INVOICE_DATE:
        {
          const newDate = new Date(event.newValue);
          const oldDate = new Date(event.oldValue);
          if (newDate.getTime() !== oldDate.getTime()) {
            this.store.dispatch(patchInvoiceDetails({ details: { date: newDate } }));
          }
          break;
        }
      case InvoiceDetailsFormItem.DUE_DATE:
        {
          const newDueDate = new Date(event.newValue);
          const oldDueDate = new Date(event.oldValue);
          if (newDueDate.getTime() !== oldDueDate.getTime()) {
            this.store.dispatch(patchInvoiceDetails({ details: { dueDate: newDueDate } }));
          }
          break;
        }
      case InvoiceDetailsFormItem.DECIMAL_PLACES:
        {
          const newDecimalPlaces = Number(event.newValue);
          const oldDecimalPlaces = Number(event.oldValue);
          if (newDecimalPlaces !== oldDecimalPlaces) {
            this.store.dispatch(patchInvoiceDetails({ details: { decimalPlaces: newDecimalPlaces } }));
          }
          break;
        }
    }
  };



  ngOnInit(): void {
    this.store.select(selectAllCurrencies).pipe(takeUntil(this.destroy$)).subscribe((currencies) => {
      this.currencies = currencies;
    });
    this.store.select(selectAllDateFormats).pipe(takeUntil(this.destroy$)).subscribe((dateFormats) => {
      this.dateFormats = dateFormats;
    });
    this.store.select(selectAllTaxes).pipe(takeUntil(this.destroy$)).subscribe((taxes) => {
      this.taxes = taxes;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  invoiceDetailsColumnDefs: ColDef<FormColumnDef>[] = [
    {
      field: 'label',
      headerName: '',
      width: 150,
      flex: 2,
      cellRendererSelector: InvoiceDetailsComponent.findDetailsLabelColumnRenderer,
    },
    {
      field: 'value',
      headerName: '',
      width: 200,
      flex: 3,
      editable: (params) => {
        const label = params.data?.label ?? '';
        const editableFields = [
          InvoiceDetailsFormItem.INVOICE_NUMBER,
          InvoiceDetailsFormItem.INVOICE_DATE,
          InvoiceDetailsFormItem.DUE_DATE,
          InvoiceDetailsFormItem.CURRENCY,
          InvoiceDetailsFormItem.DELIVERY_STATE,
          InvoiceDetailsFormItem.TAX_OPTION,
          InvoiceDetailsFormItem.DECIMAL_PLACES,
          InvoiceDetailsFormItem.DATE_FORMAT,
          InvoiceDetailsFormItem.ACCOUNT_NAME,
          InvoiceDetailsFormItem.ACCOUNT_NUMBER,
          InvoiceDetailsFormItem.BANK_NAME,
          // InvoiceDetailsFormItem.TERMS_AND_CONDITIONS
        ];
        return editableFields.includes(label as InvoiceDetailsFormItem);
      },
      cellRendererSelector: this.findDetailsCellRenderer,
      cellEditorSelector: this.findDetailsEditorComponent,
      onCellValueChanged: this.handleInvoiceDetailsCellValueChanged,
      tooltipValueGetter: (params) => {
        const value = params.data?.value;

        if (typeof value === 'string') {
          return value;
        }

        if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
          return value.name;
        }

        return '';
      },
      // suppressKeyboardEvent: (params: SuppressKeyboardEventParams<FormColumnDef>) => {
      //   switch (params.data?.label) {
      //     case InvoiceDetailsFormItem.TERMS_AND_CONDITIONS:
      //       return params.editing && params.event.key === 'Enter';
      //   }
      //   return false;
      // },
    }
  ];

  private static findDetailsLabelColumnRenderer = (params: ICellRendererParams<FormColumnDef>) => {
    return {
      component: LabelColumnRendererComponent,
      params: {
        labelValue: params.data?.label ?? '',
        maxLength: isMobile() ? 20 : 32,
        labelClass: 'text-14-500',
      },
    };
  };


  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      const invoiceDetailsRowData: FormColumnDef[] = [
        { label: InvoiceDetailsFormItem.INVOICE_NUMBER, value: invoice.number },
        { label: InvoiceDetailsFormItem.INVOICE_DATE, value: invoice.date },
        { label: InvoiceDetailsFormItem.DUE_DATE, value: invoice.dueDate },
      ];
      if (!this.simple) {
        invoiceDetailsRowData.push(
          { label: InvoiceDetailsFormItem.CURRENCY, value: invoice.currency },
          { label: InvoiceDetailsFormItem.DECIMAL_PLACES, value: invoice.decimalPlaces },
          { label: InvoiceDetailsFormItem.DELIVERY_STATE, value: invoice.deliveryState },
          { label: InvoiceDetailsFormItem.TAX_OPTION, value: invoice.taxOption },
          { label: InvoiceDetailsFormItem.ITEM_DESCRIPTION, value: invoice.hasItemDescription },
          { label: InvoiceDetailsFormItem.SHOW_DISCOUNT, value: invoice.hasItemDiscount },
        );
      }
      if (!this.simple) {
        invoiceDetailsRowData.push(
          { label: InvoiceDetailsFormItem.DATE_FORMAT, value: invoice.dateFormat },
          { label: InvoiceDetailsFormItem.ACCOUNT_NUMBER, value: invoice.accountNumber },
          { label: InvoiceDetailsFormItem.ACCOUNT_NAME, value: invoice.accountName },
          { label: InvoiceDetailsFormItem.BANK_NAME, value: invoice.bankName },
          // { label: InvoiceDetailsFormItem.TERMS_AND_CONDITIONS, value: invoice.terms },
        );
      }
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
