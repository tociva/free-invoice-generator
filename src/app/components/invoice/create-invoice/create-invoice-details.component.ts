import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams, NewValueParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import { map, Observable } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../util/constants';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { DatePickerEditorComponent } from '../../common/ag-grid/editor/date-picker-editor/date-picker-editor.component';
import { CheckboxColumnRendererComponent } from '../../common/ag-grid/renderer/checkbox-column-renderer/checkbox-column-renderer.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { setInvoiceCurrency, setInvoiceDate, setInvoiceDateFormat, setInvoiceDecimalPlaces, setInvoiceDueDate, setInvoiceItemDescription, setInvoiceShowDiscount, setInvoiceTaxOption } from '../store/actions/invoice.action';
import { Currency } from '../store/model/currency.model';
import { DateFormat } from '../store/model/date-format.model';
import { TaxOption } from '../store/model/invoice.model';
import { selectAllCurrencies } from '../store/selectors/currency.selectors';
import { selectAllDateFormats } from '../store/selectors/date-format.selectors';
import { selectInvoice } from '../store/selectors/invoice.selectors';
import { selectAllTaxes } from '../store/selectors/tax.selectors';
import { CreateInvoiceLogoComponent } from './create-invoice-logo.component';


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
}

export class CreateInvoiceDetailsComponent extends CreateInvoiceLogoComponent {

  public detailsGridApi!: GridApi<FormColumnDef>;

  private fetchCurrencies = (val?: string | Currency): Observable<Currency[]> => {
    return this.store.select(selectAllCurrencies).pipe(
      map((currencies) => {
        // If val is of type Country, return empty array
        if (val && typeof val === 'object') {
          return [];
        }

        if (!val?.trim()) {
          return currencies.slice(0, OPTIONS_COUNT);
        }

        const filterVal = val.toLowerCase();
        return currencies
          .filter((currency) => currency.name.toLowerCase().startsWith(filterVal))
          .slice(0, OPTIONS_COUNT);
      })
    );
  };

  private fetchDateFormats = (val?: string | DateFormat): Observable<DateFormat[]> => {
    return this.store.select(selectAllDateFormats).pipe(
      map((dateFormats) => {
        if (val && typeof val === 'object') {
          return [];
        }

        if (!val?.trim()) {
          return dateFormats.slice(0, OPTIONS_COUNT);
        }

        const filterVal = val.toLowerCase();
        return dateFormats
          .filter((dateFormat) => dateFormat.name.toLowerCase().startsWith(filterVal))
          .slice(0, OPTIONS_COUNT);
      })
    );
  };

  private fetchTaxOptions = (val?: string): Observable<string[]> => {
    return this.store.select(selectAllTaxes).pipe(
      map((taxes) => {
        if (!val?.trim()) {
          return taxes;
        }
        const filterVal = val.toLowerCase();
        return taxes.filter((option) => option.toLowerCase().indexOf(filterVal) !== -1);
      })
    );
  };

  private handleCurrencyOptionSelected = (val: Currency): void => {
    this.store.dispatch(setInvoiceCurrency({ currency: val }));
  };

  private handleDateFormatOptionSelected = (val: DateFormat): void => {
    this.store.dispatch(setInvoiceDateFormat({ dateFormat: val }));
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
        if(!params) {return '';}
        return params.value;
    },
      onOptionSelected: this.handleDateFormatOptionSelected
    }
  });


  private handleTaxOptionChange = (option: TaxOption): void => {
    this.store.dispatch(setInvoiceTaxOption({ option }));
  };
  
  private findDetailsEditorComponent = (cellParams: ICellEditorParams<FormColumnDef>) => {

    switch (cellParams.data.label) {

      case InvoiceDetailsFormItem.INVOICE_DATE:
      case InvoiceDetailsFormItem.DUE_DATE:
        return { component: DatePickerEditorComponent,
          params: {
            format: (this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.DATE_FORMAT)?.data?.value as DateFormat).value,
            value: cellParams.data.value
          }
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
    }

    return {
      component: null
    };

  };

  private handleItemDescriptionToggle = (val: boolean) => {
    this.store.dispatch(setInvoiceItemDescription({ itemDescription: val }));
  };

  private handleShowDiscountToggle = (val: boolean) => {
    this.store.dispatch(setInvoiceShowDiscount({ showDiscount: val }));
  };

  private findDetailsCellRenderer = (params: ICellRendererParams<FormColumnDef>) => {

    
    switch (params.data?.label) {

      case InvoiceDetailsFormItem.CURRENCY:
        { const cur = params.data.value as Currency;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: `(${cur.html ?? ''}) ${cur.name ?? ''}` }
        }; }
      case InvoiceDetailsFormItem.DATE_FORMAT:
        { const dateFormat = params.data.value as DateFormat;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: dateFormat.value }
        }; }
      case InvoiceDetailsFormItem.ITEM_DESCRIPTION:
        return { component: CheckboxColumnRendererComponent, params: { selected: params.data.value, onToggle: this.handleItemDescriptionToggle } };

      case InvoiceDetailsFormItem.SHOW_DISCOUNT:
        return { component: CheckboxColumnRendererComponent, params: { selected: params.data.value, onToggle: this.handleShowDiscountToggle } };
      case InvoiceDetailsFormItem.INVOICE_DATE:
      case InvoiceDetailsFormItem.DUE_DATE:
        { const dateFormatText = (this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.DATE_FORMAT)?.data?.value as DateFormat).value;
        const date = params.data?.value as Date;
        const dateText = dayjs(date).format(dateFormatText);
        return { component: LabelColumnRendererComponent, params: { labelValue: dateText } }; }

    }
    if (!params.data?.value) {

      return '';

    }
    return params.data.value;

  };

  private handleInvoiceDetailsCellValueChanged = (event: NewValueParams<FormColumnDef>) => {
    switch (event.data.label) {
      case InvoiceDetailsFormItem.INVOICE_DATE:
        { const newDate = new Date(event.newValue);
        const oldDate = new Date(event.oldValue);
        if (newDate.getTime() !== oldDate.getTime()) {
          this.store.dispatch(setInvoiceDate({ date: newDate }));
        }
        break; }
      case InvoiceDetailsFormItem.DUE_DATE:
        { const newDueDate = new Date(event.newValue);
        const oldDueDate = new Date(event.oldValue);
        if (newDueDate.getTime() !== oldDueDate.getTime()) {
          this.store.dispatch(setInvoiceDueDate({ dueDate: newDueDate }));
        }
        break; }
      case InvoiceDetailsFormItem.DECIMAL_PLACES:
        { const newDecimalPlaces = Number(event.newValue);
        const oldDecimalPlaces = Number(event.oldValue);
        if (newDecimalPlaces !== oldDecimalPlaces) {
          this.store.dispatch(setInvoiceDecimalPlaces({ decimalPlaces: newDecimalPlaces }));
        }
        break; }
    }
  };

  invoiceDetailsColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
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
        ];
        return editableFields.includes(label as InvoiceDetailsFormItem);
      },
      cellRendererSelector: this.findDetailsCellRenderer,
      cellEditorSelector: this.findDetailsEditorComponent,
      onCellValueChanged: this.handleInvoiceDetailsCellValueChanged
    }
  ];

  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.smallLogoPreviewUrl = invoice.smallLogo;
      this.largeLogoPreviewUrl = invoice.largeLogo;
      const invoiceDetailsRowData: FormColumnDef[] = [
        { label: InvoiceDetailsFormItem.INVOICE_NUMBER, value: invoice.number },
        { label: InvoiceDetailsFormItem.INVOICE_DATE, value: invoice.date },
        { label: InvoiceDetailsFormItem.DUE_DATE, value: invoice.dueDate },
        { label: InvoiceDetailsFormItem.CURRENCY, value: invoice.currency },
        { label: InvoiceDetailsFormItem.DECIMAL_PLACES, value: invoice.decimalPlaces },
        { label: InvoiceDetailsFormItem.DELIVERY_STATE, value: invoice.deliveryState },
        { label: InvoiceDetailsFormItem.TAX_OPTION, value: invoice.taxOption },
        { label: InvoiceDetailsFormItem.ITEM_DESCRIPTION, value: invoice.hasItemDescription },
        { label: InvoiceDetailsFormItem.SHOW_DISCOUNT, value: invoice.hasItemDiscount },
        { label: InvoiceDetailsFormItem.DATE_FORMAT, value: invoice.dateFormat },
      ];
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
}