import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from "ag-grid-community";
import { map, Observable, of } from "rxjs";
import { OPTIONS_COUNT } from "../../../../util/constants";
import { displayAutoCompleteWithName } from "../../../../util/daybook.util";
import { FormColumnDef } from "../../../../util/form-column-def.type";
import { AutoCompleteEditorComponent } from "../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component";
import { LabelColumnRendererComponent } from "../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component";
import { CheckboxCellRendererComponent } from "../../common/checkbox-cell-renderer/checkbox-cell-renderer.component";
import { DatePickerCellEditor } from "../../common/date-picker-cell-editor/date-picker-cell-editor.component";
import { Currency } from "../store/model/currency.model";
import { selectAllCurrencies } from "../store/selectors/currency.selectors";
import { CreateInvoiceItemsComponent } from "./create-invoice-items.component";
export enum InvoiceDetailsFormItem {
  INVOICE_NUMBER = 'Invoice Number',
  INVOICE_DATE = 'Invoice Date',
  DUE_DATE = 'Due Date',
  CURRENCY = 'Currency',
  DELIVERY_STATE = 'Delivery State',
  TAX_OPTION = 'Tax Option',
  ITEM_DESCRIPTION = 'Item Description',
  SHOW_DISCOUNT = 'Show Discount',
}

export class CreateInvoiceDetailsComponent extends CreateInvoiceItemsComponent {

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

  private fetchTaxOptions = (val?: string): Observable<string[]> => {
    const options = ['CGST/SGST', 'IGST', 'Non Taxable'];
    if(!val?.trim()) {
      return of(options);
    }
    const filterVal = val.toLowerCase();
    return of(options.filter(option => option.toLowerCase().indexOf(filterVal) !== -1));
  };

  private handleCurrencyOptionSelected = (val: Currency): void => {
    const rowNode = this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.CURRENCY);
    if (rowNode) {
      rowNode.data = { label: InvoiceDetailsFormItem.CURRENCY, value: val };
    }
  };

  private findCurrencyEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Currency>,
    params: {
      optionsFetcher: this.fetchCurrencies,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleCurrencyOptionSelected
    }
  });

  private findTaxOptionEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<string>,
    params: {
      optionsFetcher: this.fetchTaxOptions,
      displayWith: (params: string) => params,
    }
  });
  private findDetailsEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
    switch (params.data.label) {

    case InvoiceDetailsFormItem.INVOICE_DATE:
    case InvoiceDetailsFormItem.DUE_DATE:
      return { component: DatePickerCellEditor };

    case InvoiceDetailsFormItem.CURRENCY:
      return this.findCurrencyEditorComponent(params.data.value);

      case InvoiceDetailsFormItem.TAX_OPTION:
        return this.findTaxOptionEditorComponent(params.data.value);

    }

    return {
      component: null
    };

  };

  invoiceColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: (params) => {
        const label = params.data?.label ?? '';
        const editableFields = [InvoiceDetailsFormItem.INVOICE_NUMBER, InvoiceDetailsFormItem.INVOICE_DATE, InvoiceDetailsFormItem.DUE_DATE, InvoiceDetailsFormItem.CURRENCY, InvoiceDetailsFormItem.DELIVERY_STATE, InvoiceDetailsFormItem.TAX_OPTION];
        return editableFields.includes(label as InvoiceDetailsFormItem);
      },
      cellRendererSelector: CreateInvoiceDetailsComponent.findDetailsCellRenderer,
      cellEditorSelector: this.findDetailsEditorComponent,
    }
  ];


  private static findDetailsCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

    if (!params.data?.value) {

      return '';

    }
    switch (params.data.label) {

    case InvoiceDetailsFormItem.CURRENCY:
      const cur = params.data.value as Currency;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: `(${cur.html ?? ''}) ${cur.name ?? ''}`}};
    case InvoiceDetailsFormItem.ITEM_DESCRIPTION:
    case InvoiceDetailsFormItem.SHOW_DISCOUNT:
      return {component: CheckboxCellRendererComponent, value: false};

    }
    return params.data.value;
  
  };

  override invoiceRowData: FormColumnDef[] = [
    { label: InvoiceDetailsFormItem.INVOICE_NUMBER, value: 'INV-1001' },
    { label: InvoiceDetailsFormItem.INVOICE_DATE, value: '2025-03-31' },
    { label: InvoiceDetailsFormItem.DUE_DATE, value: '2025-04-07' },
    { label: InvoiceDetailsFormItem.CURRENCY, value: {
      name: 'Indian Rupee',
      html: '&#8377;',
      unicode: '20B9',
      decimal: 2
    }},
    { label: InvoiceDetailsFormItem.DELIVERY_STATE, value: 'Kerala' },
    { label: InvoiceDetailsFormItem.TAX_OPTION, value: 'CGST/SGST' },
    { label: InvoiceDetailsFormItem.ITEM_DESCRIPTION, value: 'true' },
    { label: InvoiceDetailsFormItem.SHOW_DISCOUNT, value: 'true' }
  ];

  onInvoiceDetailsGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.detailsGridApi = params.api;
  }

  changeCurrency(val: Currency): void {
    const rowNode = this.detailsGridApi.getRowNode(InvoiceDetailsFormItem.CURRENCY);
    if (rowNode) {
      const updated = { ...rowNode.data, value: val };
      rowNode.setData(updated as FormColumnDef);
    }
  }
}