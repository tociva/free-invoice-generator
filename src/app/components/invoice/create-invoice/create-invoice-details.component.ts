import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from "ag-grid-community";
import { map, Observable } from "rxjs";
import { OPTIONS_COUNT } from "../../../../util/constants";
import { displayAutoCompleteWithName } from "../../../../util/daybook.util";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { AutoCompleteEditorComponent } from "../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component";
import { CheckboxColumnRendererComponent } from "../../common/ag-grid/renderer/checkbox-column-renderer/checkbox-column-renderer.component";
import { LabelColumnRendererComponent } from "../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component";
import { DatePickerCellEditor } from "../../common/date-picker-cell-editor/date-picker-cell-editor.component";
import { Currency } from "../store/model/currency.model";
import { DateFormat } from "../store/model/date-format.model";
import { selectAllCurrencies } from "../store/selectors/currency.selectors";
import { selectAllDateFormats } from "../store/selectors/date-format.selectors";
import { selectInvoice } from "../store/selectors/invoice.selectors";
import { selectAllTaxes } from "../store/selectors/tax.selectors";
import { CreateInvoiceItemsComponent } from "./create-invoice-items.component";
import { setInvoiceCurrency, setInvoiceDateFormat, setInvoiceItemDescription, setInvoiceShowDiscount, setInvoiceTaxOption } from "../store/actions/invoice.action";

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

export class CreateInvoiceDetailsComponent extends CreateInvoiceItemsComponent {

  public detailsGridApi!: GridApi<FormColumnDef>;
  
  invoiceDetailsRowData: FormColumnDef[] = [];

  private changeCurrency(val: Currency): void {

    const rowNode = this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.CURRENCY);
    if (rowNode) {
      const updated = { ...rowNode.data, value: val };
      rowNode.setData(updated as FormColumnDef);
    }
  }

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
        return taxes.filter(option => option.toLowerCase().indexOf(filterVal) !== -1);
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


  private handleTaxOptionChange = (option: string): void => {
    this.store.dispatch(setInvoiceTaxOption({ option }));
  };
  
  private findDetailsEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {

    switch (params.data.label) {

      case InvoiceDetailsFormItem.INVOICE_DATE:
      case InvoiceDetailsFormItem.DUE_DATE:
        return { component: DatePickerCellEditor };

      case InvoiceDetailsFormItem.CURRENCY:
        return this.findCurrencyEditorComponent(params.data.value);

      case InvoiceDetailsFormItem.DATE_FORMAT:
        return this.findDateFormatEditorComponent(params.data.value);

      case InvoiceDetailsFormItem.TAX_OPTION:
        return {
          component: AutoCompleteEditorComponent<string>,
          params: {
            optionsFetcher: this.fetchTaxOptions,
            displayWith: (params: string) => params,
            onOptionSelected: (val: string) => this.handleTaxOptionChange(val)
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
        const cur = params.data.value as Currency;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: `(${cur.html ?? ''}) ${cur.name ?? ''}` }
        };
      case InvoiceDetailsFormItem.DATE_FORMAT:
        const dateFormat = params.data.value as DateFormat;
        return {
          component: LabelColumnRendererComponent,
          params: { labelValue: dateFormat.value }
        };
      case InvoiceDetailsFormItem.ITEM_DESCRIPTION:
        return { component: CheckboxColumnRendererComponent, params: { selected: params.data.value, onToggle: this.handleItemDescriptionToggle } };

      case InvoiceDetailsFormItem.SHOW_DISCOUNT:
        return { component: CheckboxColumnRendererComponent, params: { selected: params.data.value, onToggle: this.handleShowDiscountToggle } };

    }
    if (!params.data?.value) {

      return '';

    }
    return params.data.value;

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
    }
  ];

  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
    this.store.select(selectInvoice).subscribe((invoice) => {
      this.invoiceDetailsRowData = [
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
    });
  }
}